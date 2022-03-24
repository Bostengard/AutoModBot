const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const { punish } = require(path.resolve('./Functions/punish.js'));
const sqlite = require('sqlite3').verbose()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user that shall be warned')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why this user shall be warned')
            .setRequired(true)
        ),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)){
            return interaction.reply({content: "Missing permissions", ephemeral: true})
        }
        let user = interaction.options.getUser('user')
        let reason = interaction.options.getString('reason')
        await punish(reason,user,interaction.member,"warn",interaction)
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Warned')
            .addField('Reason', reason)
            .addField('Warned by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        await interaction.reply({embeds: [embed]})

        const logEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Warned')
            .addField('General Info', `User Warned: ${user.toString()} \`${user.id}\`\n Reason:\`${reason}\``)
            .addField('Warned by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
        db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
        db.run(`CREATE TABLE IF NOT EXISTS ServerSettings(WelcomeChannel VARCHAR(64),LogsChannel VARCHAR(64),WelcomeRole VARCHAR(64), LevelChannel VARCHAR(64))`)
        let ID;
        let channel;
        db.get(`SELECT * FROM ServerSettings`, async (err,row) =>{
            if(err) return interaction.reply({content: "There was an error while executing the command",ephemeral: true})
            if(row === undefined) return db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?)`,[0,0,0,0])
            ID = row.LogsChannel
            try{
                await interaction.guild.channels.fetch(`${ID}`)
                channel  = await interaction.guild.channels.cache.get(ID)
                channel.send({embeds: [logEmbed]})
            }
            catch{
            }
        })
    },
};
