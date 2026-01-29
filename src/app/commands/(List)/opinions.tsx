import {
  SlashCommandBuilder,
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
} from "discord.js";
import { Container, Separator, TextDisplay } from "commandkit";
import { guildId, noPingListRoleID } from "@/../config.json";
import { NoPingListAttributes } from "@/db/models";
import { ChatInputCommand, CommandData } from "commandkit";
import { NoPingList } from "@/db/models";

const mapToStr = (data: NoPingListAttributes[]) => {
  if (data.length === 0) {
    return "*None!*";
  } else {
    return data
      .map(
        (entry) =>
          `- <@${entry.userId}>${entry.notes ? ` (${entry.notes})` : ""}`,
      )
      .join("\n");
  }
};

export const command: CommandData = {
    name: "nopinglist",
    description: "No Ping List management",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "view",
            description: "Retrieve the No Ping List",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "filter",
                    description: "Filter by only No Ping List or opinion banned users",
                    choices: [
                        {
                            name: "No Ping List",
                            value: "npl"
                        },
                        {
                            name: "Banned",
                            value: "banned"
                        }
                    ]
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "Add a user to the No Ping List",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "The user to add",
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.Number,
                    name: "banned",
                    description: "Whether this user should be opinion banned",
                    choices: [
                        { name: "Yes", value: 1, },
                        { name: "No", value: 0 },
                    ]
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "notes",
                    description: "Extra info about this user",
                },
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "Remove a user from the No Ping List",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "The user to add",
                    required: true,
                },
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "find",
            description: "Check to see if a user is on the No Ping List",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "The user to find",
                    required: true,
                },
            ]
        },
    ]
}

export const chatInput: ChatInputCommand = async ({interaction}) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "view") {
        const allUsers = await NoPingList.findAll();
        const banned = [];
        const noPingList: NoPingListAttributes[] = [];
        for (const user of allUsers) {
            if (user.dataValues.banned) banned.push(user.dataValues);
            else noPingList.push(user.dataValues);
        }

        const container = (
            <Container accentColor={0xff0000}>
                <TextDisplay>
                    ## No Ping List
                </TextDisplay>
                <TextDisplay>
                    There are {allUsers.length} players in the No Ping List.
                </TextDisplay>
                <Separator spacing={SeparatorSpacingSize.Small}/>
                <TextDisplay>
                    **__Opinion Banned__**
                </TextDisplay>
                <TextDisplay>
                    {mapToStr(banned)}
                </TextDisplay>
                <TextDisplay>
                    **__No Ping List__**
                </TextDisplay>
                <TextDisplay>
                    {mapToStr(noPingList)}
                </TextDisplay>
            </Container>
        )
        return await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
        });
    } else if (subcommand === "add") {
        const user = interaction.options.getUser("user", true);
        const banned = interaction.options.getNumber("banned") === 1;
        const notes = interaction.options.getString("notes");

        const [entry, created] = await NoPingList.findOrCreate({
            where: { userId: user.id },
            defaults: {
                banned: banned,
                notes: notes ?? undefined,
            },
        });

        if (!created) {
            entry.dataValues.banned = banned;
            entry.dataValues.notes = notes ?? undefined;
            entry.save();
        }

        // do not add role if banning
        if (!banned) {
            interaction.client.guilds.cache
                .get(guildId)
                ?.members.cache.get(user.id)
                ?.roles.add(noPingListRoleID);
        }

        await interaction.editReply(
            `:white_check_mark: ${user} has been ${banned ? "opinion banned" : "added to the No Ping List"}!`,
        );
    } else if (subcommand === "remove") {
        const user = interaction.options.getUser("user", true);

        const entry = await NoPingList.findOne({
            where: { userId: user.id },
        });
        if (!entry) {
            return await interaction.editReply(
                `:x: ${user} is not on the No Ping List.`,
            );
        }

        await entry.destroy();
        await interaction.client.guilds.cache
            .get(guildId)
            ?.members.cache.get(user.id)
            ?.roles.remove(noPingListRoleID);

        await interaction.editReply(
            `:white_check_mark: ${user} has been removed from the No Ping List!`,
        );
    } else if (subcommand === "find") {
        const user = interaction.options.getUser("user", true);
        const entry = await NoPingList.findOne({
            where: { userId: user.id },
        });
        if (!entry) {
            return await interaction.editReply(
                `:x: ${user} is not on the No Ping List.`,
            );
        }

        return await interaction.editReply(
            `:white_check_mark: ${user} is ${entry.dataValues.banned ? "opinion banned" : "on the No Ping List"}.`,
        );
    }
}
