// =============================================
// FORMULÁRIO DE PRÉ-ANÁLISE — COMPLETO E FUNCIONAL
// =============================================

document.getElementById('preForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const formObject = Object.fromEntries(formData.entries());
  const messageElement = document.getElementById('formMessage');
  const submitButton = this.querySelector('button[type="submit"]');

  // Validação do CPF (opcional)
  if (!validarCPF(formObject.cpf)) {
    showMessage(messageElement, 'CPF inválido', 'error');
    return;
  }

  // Mostra estado de carregamento
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="loading-spinner"></span> Enviando...';

  try {
    // 1. Envia para o Google Sheets
    const success = await enviarParaGoogleSheets(formObject);
    
    if (success) {
      // 2. (Opcional) Envia notificação WhatsApp
      try {
        await enviarWhatsAppNotification(formObject);
      } catch (whatsappError) {
        console.warn("Erro no WhatsApp:", whatsappError);
      }
      
      showMessage(messageElement, 'Pré-análise enviada com sucesso!', 'success');
      this.reset();
    } else {
      throw new Error('Falha no envio');
    }
    
  } catch (error) {
    showMessage(messageElement, 
      'Envio recebido! Se não obtiver retorno em 2h, contate (21) 98319-6542', 
      'warning');
    console.error("Erro completo:", error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar pré-análise';
  }
});

// SUAS FUNÇÕES DE APOIO AQUI ▼

async function enviarParaGoogleSheets(dados) {
  // ★ Substitua pela URL REAL do seu Google Apps Script!
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbxSFjcs3J_g8JDjf95cD6Q6qI1wj7WxzyrYSXZ5UR9_bNtHc3Q3mk0pcv9F8WSeBf3a/exec';
  
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    
    // Não podemos verificar o status devido ao 'no-cors'
    console.log("Requisição enviada (resposta não legível)");
    return true;
    
  } catch (error) {
    console.error("Erro de rede:", error);
    return false;
  }
}

async function enviarWhatsAppNotification(dados) {
  const whatsappMessage = `🏡 *NOVA PRÉ-ANÁLISE* 🏡\n\n` +
    `👤 Nome: ${dados.nome}\n` +
    `📞 Telefone: ${dados.telefone}\n` + 
    `🆔 CPF: ${dados.cpf}\n` +
    `💰 Renda: R$ ${dados.renda || 'N/A'}\n` +
    `⏳ ${new Date().toLocaleString()}`;

  const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=5521936193145&text=${encodeURIComponent(whatsappMessage)}&apikey=5982281`;
  
  await fetch(callmebotUrl); // Não precisa await se for opcional
}

function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `form-message ${type}`;
  element.scrollIntoView({ behavior: 'smooth' });
}

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  let digito1 = resto > 9 ? 0 : resto;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  let digito2 = resto > 9 ? 0 : resto;

  return parseInt(cpf.charAt(9)) === digito1 && parseInt(cpf.charAt(10)) === digito2;
}

async function sendWhatsAppNotification(data) {
  const whatsappMessage = `🏡 *NOVA PRÉ-ANÁLISE IMOBILIÁRIA* 🏡\n\n` +
    `👤 Nome: ${data.nome}\n` +
    `📞 Telefone: ${data.telefone}\n` +
    `🆔 CPF: ${data.cpf}\n` +
    `💍 Estado Civil: ${data.estado_civil}\n` +
    `👶 Tem filhos: ${data.filhos === 'sim' ? 'Sim' : 'Não'}\n` +
    `💰 Renda: R$ ${data.renda}\n` +
    `🏢 Tempo na empresa: ${data.tempo_empresa} anos\n` +
    `🎂 Data Nasc.: ${data.nascimento}\n` +
    `📧 E-mail: ${data.email}\n` +
    `⏳ Contatar em até 2 horas`;

  const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=5521936193145&text=${encodeURIComponent(whatsappMessage)}&apikey=5982281`;

  const response = await fetch(callmebotUrl);
  if (!response.ok) throw new Error('Erro ao enviar WhatsApp');
  return true;
}

const toggleBtn = document.getElementById('showAnalysisBtn');
const analysisSection = document.getElementById('preAnalysisSection');

if (toggleBtn && analysisSection) {
  toggleBtn.addEventListener('click', function (e) {
    e.preventDefault();
    analysisSection.classList.toggle('hidden');
    toggleBtn.textContent = analysisSection.classList.contains('hidden')
      ? 'Faça sua pré-análise'
      : 'Fechar pré-análise';

    if (!analysisSection.classList.contains('hidden')) {
      analysisSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.btMenu').addEventListener('click', function() {
    document.querySelector('.menuLateral').classList.toggle('active');
  });
});

// Dark Mode Functionality
function setupDarkMode() {
  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'dark-mode-toggle';
  toggleBtn.innerHTML = '<i class="bx bx-moon"></i>';
  toggleBtn.title = 'Alternar Modo Escuro';
  document.body.appendChild(toggleBtn);

  // Check for saved user preference
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    toggleBtn.innerHTML = '<i class="bx bx-sun"></i>';
  }

  // Toggle function
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toggleBtn.innerHTML = isDark ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
  }

  // Add event listener
  toggleBtn.addEventListener('click', toggleDarkMode);
}

// Initialize dark mode functionality
setupDarkMode();


