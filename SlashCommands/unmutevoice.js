const { SlashCommandBuilder } = require('@discordjs/builders');
const {Permissions} = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmutevoice')
        .setDescription('unmutes your voice channel')
        .addStringOption(option => option.setName('reason').setDescription('Why are you muting')),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)) return interaction.reply({content: "missing permissions", ephemeral: true})
        let reason = interaction.options.getString('reason')
        let channel = interaction.member.voice.channel;
        if(!channel){return interaction.reply({content:"U are not on a voice channel", ephemeral:true})}
        channel.members.forEach(function (member){
            try{
                member.voice.setMute(false)
            }catch{}

        })
        interaction.reply({content:"succesfully muted " + channel.toString() + " " + reason,ephemeral:false})

    },
};
