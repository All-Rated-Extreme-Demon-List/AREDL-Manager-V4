import { Embeds } from "@/db/models";
import {
	CommandData,
	ChatInputCommand,
	AutocompleteCommand,
	Logger,
	ActionRow,
	Button,
} from "commandkit";
import {
	ApplicationCommandOptionType,
	HexColorString,
	LabelBuilder,
	MessageFlags,
	ModalSubmitInteraction,
	ModalSubmitInteractionCollectorOptions,
} from "discord.js";
import {
	SlashCommandBuilder,
	resolveColor,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

export const command: CommandData = {
	name: "embed",
	description: "Bot embed messages management",
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "create",
			description: "Creates a new embed message",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description:
						"Internal name of the embed, to be able to edit it later",
					required: true,
				},
				{
					type: ApplicationCommandOptionType.Channel,
					name: "channel",
					description: "Channel to send the embed in",
					required: true,
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "title",
					description: "Title of the embed",
					max_length: 256,
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "color",
					description: "Embed color",
				},
				{
					type: ApplicationCommandOptionType.Attachment,
					name: "image",
					description: "Embed image",
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "edit",
			description: "Edit a previously sent embed message",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "Internal name of the embed to edit",
					required: true,
					autocomplete: true,
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "title",
					description: "New title of the embed",
					max_length: 256,
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "color",
					description: "New color of the embed",
				},
				{
					type: ApplicationCommandOptionType.Attachment,
					name: "image",
					description: "New image of the embed",
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "delete",
			description: "Delete a previously sent embed message",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "Internal name of the embed to delete",
					required: true,
					autocomplete: true,
				},
			],
		},
	],
};

export const autocomplete: AutocompleteCommand = async ({ interaction }) => {
	const focused = interaction.options.getFocused();
	return await interaction.respond(
		(
			await Embeds.findAll({
				where: { guild: interaction.guild?.id ?? "1" },
			})
		)
			.filter((embed) =>
				embed.dataValues.name
					.toLowerCase()
					.includes(focused.toLowerCase()),
			)
			.slice(0, 25)
			.map((embed) => ({
				name: embed.dataValues.name,
				value: embed.dataValues.name,
			})),
	);
};

export const chatInput: ChatInputCommand = async ({ interaction }) => {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	const subcommand = interaction.options.getSubcommand();

	if (subcommand === "create") {
		const name = interaction.options.getString("name", true);
		const channel = interaction.options.getChannel("channel", true);
		const title = interaction.options.getString("title");
		const color = interaction.options.getString("color");
		const image = interaction.options.getAttachment("image");

		if (
			await Embeds.findOne({
				where: { name: name, guild: interaction.guild?.id ?? "1" },
			})
		) {
			return await interaction.editReply({
				content:
					":x: An embed with that name already exists in this server",
			});
		}

		let colorResolved;
		if (color) {
			try {
				const colorStr = ("#" +
					(color.startsWith("#")
						? color.slice(1)
						: color)) as HexColorString;
				colorResolved = resolveColor(colorStr);
				if (!colorResolved)
					return await interaction.editReply({
						content: ":x: Invalid color",
					});
			} catch (error) {
				return await interaction.editReply({
					content: `:x: Failed to resolve the color: ${error}`,
				});
			}
		}

		const channelResolved = await interaction.guild?.channels.cache.get(
			channel.id,
		);
		if (!channelResolved || !channelResolved.isSendable())
			return await interaction.editReply({
				content: ":x: Invalid channel",
			});

		await interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedDescriptionModal")
				.setTitle("Enter Embed Text")
				.addLabelComponents(
					new LabelBuilder()
						.setLabel("Embed Text (can be empty)")
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId("descriptionInput")
								.setStyle(TextInputStyle.Paragraph)
								.setRequired(false)
								.setMaxLength(4000),
						),
				),
		);

		const submittedModalInteraction = await interaction
			.awaitModalSubmit({
				filter: (i) =>
					i.customId === "embedDescriptionModal" &&
					i.user.id === interaction.user.id,
				time: 300_000,
			})
			.catch(() => null);

		let description = null;
		if (submittedModalInteraction) {
			description =
				submittedModalInteraction.fields.getTextInputValue(
					"descriptionInput",
				);

			if (!title && !description && !image)
				return await submittedModalInteraction.editReply({
					content:
						":x: This embed is empty: you must provide at least a title, a description, or an image",
				});

			const embed = new EmbedBuilder();
			if (title) embed.setTitle(title);
			if (description) embed.setDescription(description);
			embed.setColor(colorResolved ?? "Default");
			try {
				if (image) embed.setImage(image.url);
			} catch (error) {
				Logger.error(`Failed to set the image: ${error}`);
				return await submittedModalInteraction.editReply({
					content: `:x: Failed to set the image: ${error}`,
				});
			}

			const confirm = new ButtonBuilder()
				.setCustomId("confirm")
				.setLabel("Send Embed")
				.setStyle(ButtonStyle.Success);

			const cancel = new ButtonBuilder()
				.setCustomId("cancel")
				.setLabel("Cancel")
				.setStyle(ButtonStyle.Danger);

			const row = (
				<ActionRow>
					<Button
						customId="confirm"
						label="Send Embed"
						style={ButtonStyle.Success}
					/>
					<Button
						customId="cancel"
						label="Cancel"
						style={ButtonStyle.Danger}
					/>
				</ActionRow>
			);

			let response;
			try {
				response = await submittedModalInteraction.editReply({
					content: "Embed preview:",
					embeds: [embed],
					components: [row],
				});
			} catch (error) {
				Logger.error(`Failed to create the embed: ${error}`);
				return await submittedModalInteraction.editReply({
					content: `:x: Failed to create the embed: ${error}`,
				});
			}

			try {
				const confirmation = await response.awaitMessageComponent({
					filter: (i) => i.user.id === interaction.user.id,
					time: 60_000,
				});
				if (confirmation.customId === "confirm") {
					let sent;
					try {
						sent = await channelResolved.send({
							embeds: [embed],
						});
					} catch (error) {
						Logger.error(`Failed to send ${name} embed: ${error}`);
						return await confirmation.update({
							content: `:x: Failed to send the embed. Check the bot permissions and try again.`,
							components: [],
						});
					}

					await Embeds.create({
						name: name,
						guild: submittedModalInteraction.guild?.id ?? "1",
						channel: channel.id,
						discordid: sent.id,
					});

					await confirmation.update({
						content: `:white_check_mark: Embed sent successfully`,
						components: [],
					});
				} else if (confirmation.customId === "cancel") {
					await confirmation.update({
						content: ":x: Action cancelled",
						components: [],
						embeds: [],
					});
				}
			} catch (e) {
				await submittedModalInteraction.editReply({
					content:
						":x: Confirmation not received within 1 minute, cancelling",
					components: [],
					embeds: [],
				});
			}
		}
	} else if (subcommand === "edit") {
		const name = interaction.options.getString("name", true);
		const newTitle = interaction.options.getString("title");
		const color = interaction.options.getString("color");
		const newImage = interaction.options.getAttachment("image");

		const embedEntry = await Embeds.findOne({
			where: { name: name, guild: interaction.guild?.id ?? "1" },
		});
		if (!embedEntry) {
			return await interaction.editReply({
				content: `:x: No embed found with the name "${name}"`,
			});
		}

		const channel = await interaction.guild?.channels.cache.get(
			embedEntry.dataValues.channel,
		);
		if (!channel || !channel.isTextBased()) {
			return await interaction.editReply({
				content:
					":x: Could not find the channel where the embed was sent.",
			});
		}

		const targetMessage = await channel.messages
			.fetch(embedEntry.dataValues.discordid)
			.catch(() => null);
		if (!targetMessage) {
			return await interaction.editReply({
				content:
					":x: Could not find the original embed to edit. It might have been deleted.",
			});
		}

		if (!(targetMessage.embeds.length > 0) || !targetMessage.embeds[0]) {
			return await interaction.editReply({
				content: ":x: The target message does not contain an embed.",
			});
		}

		let colorResolved;
		if (color) {
			try {
				const colorStr = (
					"#" + color.startsWith("#") ? color.slice(1) : color
				) as HexColorString;
				colorResolved = resolveColor(colorStr);
				if (!colorResolved)
					return await interaction.editReply({
						content: ":x: Invalid color",
					});
			} catch (error) {
				return await interaction.editReply({
					content: `:x: Failed to resolve the color: ${error}`,
				});
			}
		}
		await interaction.showModal(
			new ModalBuilder()
				.setCustomId("editEmbedModal")
				.setTitle("Edit Embed Content")
				.addLabelComponents(
					new LabelBuilder()
						.setLabel("New Embed Description (can be empty)")
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId("editDescriptionInput")
								.setStyle(TextInputStyle.Paragraph)
								.setRequired(false)
								.setMaxLength(4000)
								.setValue(
									targetMessage.embeds[0]?.description || "",
								),
						),
				),
		);

		const editSubmittedModal = await interaction
			.awaitModalSubmit({
				filter: (i) =>
					i.customId === "editEmbedModal" &&
					i.user.id === interaction.user.id,
				time: 300_000,
			})
			.catch(() => null);

		if (!editSubmittedModal) {
			return await interaction.followUp({
				content:
					":x: No response received within the time limit. Action cancelled.",
				flags: MessageFlags.Ephemeral,
			});
		}

		const newDescription = editSubmittedModal.fields.getTextInputValue(
			"editDescriptionInput",
		);

		const updatedEmbed = new EmbedBuilder(targetMessage.embeds[0]?.toJSON());
		if (newDescription) updatedEmbed.setDescription(newDescription);
		if (newTitle) updatedEmbed.setTitle(newTitle);
		if (newImage) updatedEmbed.setImage(newImage.url);
		if (colorResolved) updatedEmbed.setColor(colorResolved);

		const editRow = (
			<ActionRow>
				<Button
					customId="confirmEdit"
					label="Confirm Edit"
					style={ButtonStyle.Success}
				/>
				<Button
					customId="cancelEdit"
					label="Cancel Edit"
					style={ButtonStyle.Danger}
				/>
			</ActionRow>
		)

		let editResponse;
		try {
			editResponse = await editSubmittedModal.editReply({
				content: "Embed preview (edited):",
				embeds: [updatedEmbed],
				components: [editRow],
			});
		} catch (error) {
			Logger.error(`Failed to create the edited embed preview: ${error}`);
			return await editSubmittedModal.editReply({
				content: `:x: Failed to create the edited embed preview: ${error}`,
			});
		}

		try {
			const editConfirmation = await editResponse.awaitMessageComponent({
				filter: (i) => i.user.id === interaction.user.id,
				time: 60_000,
			});

			if (editConfirmation.customId === "confirmEdit") {
				try {
					await targetMessage.edit({ embeds: [updatedEmbed] });
				} catch (error) {
					Logger.error(`Failed to edit the embed: ${error}`);
					return await editConfirmation.update({
						content: `:x: Failed to edit the embed: ${error}`,
						components: [],
					});
				}

				await editConfirmation.update({
					content: `:white_check_mark: Embed edited successfully`,
					components: [],
				});
			} else if (editConfirmation.customId === "cancelEdit") {
				await editConfirmation.update({
					content: ":x: Edit action cancelled",
					components: [],
				});
			}
		} catch (error) {
			await editSubmittedModal.editReply({
				content:
					":x: Confirmation not received within 1 minute, cancelling",
				components: [],
			});
		}
	} else if (subcommand === "delete") {
		const name = interaction.options.getString("name", true);

		const embedEntry = await Embeds.findOne({
			where: { name: name, guild: interaction.guild?.id },
		});
		if (!embedEntry) {
			return await interaction.editReply({
				content: `:x: No embed found with the name "${name}"`,
			});
		}

		const channel = await interaction.guild?.channels.cache.get(
			embedEntry.dataValues.channel,
		);
		if (!channel || !channel.isTextBased()) {
			return await interaction.editReply({
				content:
					":x: Could not find the channel where the embed was sent.",
			});
		}

		const targetMessage = await channel.messages
			.fetch(embedEntry.dataValues.discordid)
			.catch(() => null);

		try {
			await embedEntry.destroy();
		} catch (error) {
			Logger.error(`Failed to delete the embed: ${error}`);
			return await interaction.editReply({
				content: `:x: Failed to delete the embed from the bot: ${error}`,
			});
		}
		if (targetMessage) {
			try {
				await targetMessage.delete();
			} catch (error) {
				Logger.error(`Failed to delete the embed: ${error}`);
				return await interaction.editReply({
					content: `:x: Removed the embed from the bot, but failed to delete the message: ${error}`,
				});
			}
		}
 		
		await interaction.editReply({
			content: `:white_check_mark: Embed "${name}" deleted successfully`,
		});
	}
};
