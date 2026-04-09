const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== CONFIG =====
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ===== CARREGAR CÓDIGOS =====
let codigos = { disponiveis: [], usados: {} };

if (fs.existsSync('codigos.json')) {
  codigos = JSON.parse(fs.readFileSync('codigos.json'));
}

// ===== SALVAR =====
function salvarCodigos() {
  fs.writeFileSync('codigos.json', JSON.stringify(codigos, null, 2));
}

// ===== PEGAR CÓDIGO =====
function pegarCodigo(userId) {

  // já tem código
  if (codigos.usados[userId]) {
    return codigos.usados[userId];
  }

  // acabou códigos
  if (codigos.disponiveis.length === 0) {
    return null;
  }

  const codigo = codigos.disponiveis.shift();
  codigos.usados[userId] = codigo;

  salvarCodigos();

  return codigo;
}

// ===== SLASH COMMAND =====
const commands = [
  new SlashCommandBuilder()
    .setName('pinashub')
    .setDescription('Entrar nos torneios')
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash registrado!');
  } catch (err) {
    console.log(err);
  }
})();

// ===== BOT ONLINE =====
client.once('ready', () => {
  console.log(`🔥 Bot online: ${client.user.tag}`);
});

// ===== INTERAÇÕES =====
client.on('interactionCreate', async (interaction) => {

  // 🎮 /pinashub
  if (interaction.isChatInputCommand()) {

    const embed = new EmbedBuilder()
      .setTitle('🎮 Pinas Hub')
      .setDescription('Escolha o torneio que deseja participar');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('pinas')
        .setLabel('🔥 Pinas Hub #1')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('newba')
        .setLabel('🟣 Copa Newba (em breve)')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }

  // 🔥 PINAS HUB
  if (interaction.isButton() && interaction.customId === 'pinas') {

    const codigo = pegarCodigo(interaction.user.id);

    if (!codigo) {
      return interaction.reply({
        content: '❌ Acabaram os códigos!',
        ephemeral: true
      });
    }

    return interaction.reply({
      content: `🎮 **INSCRIÇÃO CONFIRMADA!**

Fala, jogador! 😈🔥
Você está oficialmente dentro do torneio **Pinas Hub #1**.

🔗 **Link do torneio:**
[Acesse aqui](https://battlefy.com/dreanitto/pinashub/69d6b1f9682e67002fbbaca4/info)

🔑 **Seu código de acesso:**
\`${codigo}\`

⚠️ **IMPORTANTE:**

• Esse código é **individual e intransferível**
• Não compartilhe com ninguém
• Você vai precisar dele para participar das partidas

🔥 Agora é com você...
**chegou sua hora de pinar.**`,
      ephemeral: true
    });
  }

});

client.login(TOKEN);