// Este script contém funcionalidades gerais para o site, como a validação do formulário de contato.

// Função para exibir mensagens de feedback para o usuário no formulário de contato
function showFormMessage(message, type) {
    const formMessageElement = document.getElementById('formMessage');
    formMessageElement.textContent = message; // Define o texto da mensagem
    formMessageElement.className = `mt-3 text-start ${type}`; // Aplica classes de estilo (success ou error)
    formMessageElement.style.display = 'block'; // Torna a mensagem visível

    // Esconde a mensagem após 5 segundos para uma melhor experiência do usuário
    setTimeout(() => {
        formMessageElement.style.display = 'none';
        formMessageElement.textContent = ''; // Limpa o texto da mensagem
        formMessageElement.className = 'mt-3 text-start'; // Remove as classes de estilo
    }, 5000);
}

// Função para lidar com o envio do formulário de contato
async function handleContactFormSubmit(event) { // Adicionado 'async' pois faremos uma requisição assíncrona
    event.preventDefault(); // Impede o envio padrão do formulário, evitando o recarregamento da página

    // Captura os valores dos campos do formulário
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value; // Novo campo de telefone
    const message = document.getElementById('contactMessage').value;

    // URL do seu aplicativo da web Google Apps Script
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTBig30O2bj_vGbgGnrAm90OpCX8HRrKOMOR2wm_gmW4bUJiYZs73IbxKfeISB9YOf/exec'; // URL atualizada

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!name || !email || !message) {
        showFormMessage('Por favor, preencha todos os campos obrigatórios (Nome, E-mail, Mensagem).', 'error');
        return;
    }

    // Opcional: Adicionar uma simples validação para o telefone se for importante
    // if (phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone)) { // Exemplo para (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
    //     showFormMessage('Por favor, insira um telefone válido no formato (DD) XXXXX-XXXX.', 'error');
    //     return;
    // }

    // Prepara os dados do formulário para envio (formato FormData para Apps Script)
    const formData = new FormData();
    formData.append('contactName', name);
    formData.append('contactEmail', email);
    formData.append('contactPhone', phone); // Adiciona o telefone
    formData.append('contactMessage', message);

    // Desabilita o botão de envio para evitar múltiplos cliques
    const submitButton = event.submitter;
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...'; // Altera o texto do botão
    }

    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST', // Usa o método POST
            body: formData, // Envia os dados do formulário
            // Não defina Content-Type, o fetch com FormData fará isso automaticamente e corretamente
        });

        const result = await response.json(); // Espera a resposta JSON do Apps Script

        if (result.result === 'success') {
            showFormMessage('Obrigado! Sua mensagem foi enviada com sucesso e logo entraremos em contato.', 'success');
            document.getElementById('contactForm').reset(); // Limpa o formulário após o envio
        } else {
            // Exibe mensagem de erro do Apps Script
            showFormMessage(`Erro ao enviar: ${result.message || 'Erro desconhecido.'}`, 'error');
        }

    } catch (error) {
        // Captura e exibe erros de rede ou outros erros durante a requisição
        console.error('Erro na requisição do formulário:', error);
        showFormMessage(`Ocorreu um erro de conexão. Por favor, tente novamente mais tarde.`, 'error');
    } finally {
        // Reabilita o botão de envio
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Mensagem';
        }
    }
}

// Adiciona um listener para o evento de envio do formulário quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
});
