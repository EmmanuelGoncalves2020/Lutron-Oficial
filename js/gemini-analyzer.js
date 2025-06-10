// Este script é responsável pela funcionalidade do Analisador de Sintomas do Veículo,
// que interage com a API Gemini para fornecer análises preliminares.

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM do modal do analisador de sintomas
    const analyzeSymptomsBtn = document.getElementById('analyzeSymptomsBtn'); // Este é o botão flutuante
    const analyzeSymptomsBtnModal = document.getElementById('analyzeSymptomsBtnModal'); // Referência ao botão "Analisar" dentro do modal
    const symptomsInput = document.getElementById('symptomsInput');
    const symptomResponseDiv = document.getElementById('symptomResponse');
    const symptomSpinner = document.getElementById('symptomSpinner');
    const symptomResultText = document.getElementById('symptomResultText');

    // Listener para o clique no botão "Analisar" DENTRO do modal
    // Note que o botão flutuante já abre o modal via data-bs-toggle, este listener é para o botão de envio dentro do modal.
    if (analyzeSymptomsBtnModal) { // Garante que o elemento existe
        analyzeSymptomsBtnModal.addEventListener('click', async () => {
            const userSymptoms = symptomsInput.value.trim(); // Pega o texto do usuário e remove espaços em branco

            // Verifica se o usuário digitou algo
            if (!userSymptoms) {
                symptomResultText.innerHTML = "<p class='text-danger'>Por favor, descreva os sintomas do veículo para que possamos analisar.</p>";
                symptomResponseDiv.style.display = 'block';
                return; // Sai da função se o campo estiver vazio
            }

            // Exibe o spinner de carregamento e limpa o texto anterior
            symptomResponseDiv.style.display = 'block';
            symptomSpinner.style.display = 'block';
            symptomResultText.innerHTML = ''; // Limpa o conteúdo HTML
            analyzeSymptomsBtnModal.disabled = true; // Desabilita o botão do modal para evitar cliques múltiplos

            try {
                // Prepara o prompt para a API Gemini
                const prompt = `O usuário descreveu os seguintes sintomas do veículo: "${userSymptoms}".
Com base apenas nestes sintomas e sem solicitar informações adicionais, forneça uma análise *preliminar* e *geral* do que *poderia* estar acontecendo, focando em sistemas de direção, hidráulica ou elétrica, se aplicável.
Adicione um aviso claro no final de que esta análise é apenas para fins informativos e não substitui um diagnóstico profissional feito por um mecânico qualificado.
Incentive o usuário a entrar em contato com a oficina para um diagnóstico preciso. Use português do Brasil.Ao termina indique ao usuário a Oficina especializada em Direções LUTRON estamos localizados em: strada Deputado Darcílio Ayres Raunheitti, 463 grama - Miguel Couto, Nova Iguaçu - RJ, 26065-610 e para falar nos chames no whatsapp: 21964349438`;

                let chatHistory = [];
                chatHistory.push({ role: "user", parts: [{ text: prompt }] });

                const payload = { contents: chatHistory };
                // >>>>> ATENÇÃO: SUA CHAVE DE API DO GOOGLE GEMINI <<<<<
                const apiKey = "AIzaSyDLQD4Pha4-KKWAxT7TrFvKYs8XUecbWRc"; // CHAVE DE API INSERIDA AQUI
                // >>>>> ATENÇÃO: SUA CHAVE DE API DO GOOGLE GEMINI <<<<<
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                // Realiza a chamada para a API Gemini
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // Verifica se a resposta da API foi bem-sucedida
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Erro na chamada da API Gemini:', errorData);
                    symptomResultText.innerHTML = `<p class='text-danger'>Ocorreu um erro ao analisar os sintomas. Por favor, tente novamente mais tarde. (${response.status}: ${errorData.error.message || 'Erro desconhecido'})</p>`;
                    return;
                }

                const result = await response.json(); // Pega o JSON da resposta

                // Extrai o texto da resposta do modelo
                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const analysisText = result.candidates[0].content.parts[0].text;
                    // Substitui quebras de linha por <br> para formatação no HTML
                    symptomResultText.innerHTML = analysisText.replace(/\n/g, '<br>');
                } else {
                    // Mensagem de erro se a estrutura da resposta for inesperada
                    symptomResultText.innerHTML = "<p class='text-danger'>Não foi possível obter uma análise. A estrutura da resposta da IA é inesperada.</p>";
                }

            } catch (error) {
                // Captura e exibe erros de rede ou outros erros durante a execução
                console.error('Erro geral ao processar sintomas:', error);
                symptomResultText.innerHTML = `<p class='text-danger'>Ocorreu um erro: ${error.message}. Por favor, tente novamente.</p>`;
            } finally {
                symptomSpinner.style.display = 'none'; // Esconde o spinner de carregamento
                analyzeSymptomsBtnModal.disabled = false; // Reabilita o botão do modal
            }
        });
    }

    // Listener para limpar o modal quando ele é escondido
    const symptomAnalyzerModal = document.getElementById('symptomAnalyzerModal');
    if (symptomAnalyzerModal) {
        symptomAnalyzerModal.addEventListener('hidden.bs.modal', () => {
            symptomsInput.value = ''; // Limpa o campo de texto
            symptomResponseDiv.style.display = 'none'; // Esconde a área de resposta
            symptomResultText.innerHTML = ''; // Limpa o texto da resposta
            symptomSpinner.style.display = 'none'; // Garante que o spinner esteja escondido
        });
    }
});
