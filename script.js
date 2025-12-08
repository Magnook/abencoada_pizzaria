document.addEventListener('DOMContentLoaded', () => {
    const itens = document.querySelectorAll('input[type="checkbox"]');
    const form = document.getElementById('form-pedido');
    const totalEl = document.getElementById('total');
    const frete = 5;
    let total = 0;

    // Ativar selects ao checkar
    itens.forEach(item => {
        item.addEventListener('change', () => {
            const select = document.getElementById(`qtd-${item.id}`);
            select.disabled = !item.checked;
            calcularTotal();
        });
    });

    // Calcular total ao mudar qtd
    document.querySelectorAll('.form-select').forEach(select => {
        select.addEventListener('change', calcularTotal);
    });

    function calcularTotal() {
        total = frete;
        itens.forEach(item => {
            if (item.checked) {
                const preco = parseFloat(item.dataset.preco);
                const qtd = parseInt(document.getElementById(`qtd-${item.id}`).value);
                total += preco * qtd;
            }
        });
        totalEl.textContent = `Total (com frete R$5): R$${total.toFixed(2)}`;
    }

    // Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validar reCAPTCHA
        const recaptcha = grecaptcha.getResponse();
        if (!recaptcha) {
            alert('Por favor, confirme que não é um robô.');
            return;
        }

        // Montar resumo do pedido
        let resumo = 'Itens: ';
        itens.forEach(item => {
            if (item.checked) {
                const label = item.parentElement.textContent.trim();
                const qtd = document.getElementById(`qtd-${item.id}`).value;
                resumo += `${label} x${qtd}, `;
            }
        });
        resumo += `\nObservações: ${document.getElementById('observacoes').value}`;
        resumo += `\nPagamento: ${document.getElementById('pagamento').value}`;
        resumo += `\nTotal: R$${total.toFixed(2)}`;

        // Enviar para Google Forms (substitua o action URL)
        const formData = new FormData();
        formData.append('entry.1234567890', document.getElementById('nome').value); // Substitua IDs dos campos do Google Forms
        formData.append('entry.0987654321', document.getElementById('endereco').value);
        formData.append('entry.1122334455', document.getElementById('telefone').value);
        formData.append('entry.6677889900', resumo);
        formData.append('entry.5566778899', total.toFixed(2));

        fetch('https://docs.google.com/forms/d/e/SEU_FORM_ID/formResponse', { // Substitua pelo seu form action
            method: 'POST',
            body: formData
        }).then(() => {
            // Abrir WhatsApp com mensagem pré-preenchida
            const numeroPizzaria = '559999999999'; // Substitua pelo número da pizzaria (com DDD, sem +)
            const msg = encodeURIComponent(`Olá! Meu nome é ${document.getElementById('nome').value}. Pedido: ${resumo}. Endereço: ${document.getElementById('endereco').value}.`);
            window.location.href = `https://wa.me/${numeroPizzaria}?text=${msg}`;
        }).catch(err => alert('Erro ao enviar. Tente novamente.'));
    });
});