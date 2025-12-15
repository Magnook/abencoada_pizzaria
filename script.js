let cardapio = [];
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || []; // Persistência

fetch('cardapio.json')
    .then(r => r.json())
    .then(data => {
        cardapio = data;
        renderizarCardapio();
        atualizarCarrinho();
        atualizarTotal();
    });

function renderizarCardapio() {
    const container = document.getElementById('cardapio-container');
    container.innerHTML = '';
    cardapio.forEach((secao, idxSecao) => {
        const col = document.createElement('div');
        col.className = 'col-12';
        col.innerHTML = `
      <h3 class="text-center my-4 text-warning">${secao.tamanho}</h3>
      <div class="row g-3">
        ${secao.itens.map((item, idx) => {
            const partes = item.split(' ');
            const nome = partes.slice(0, -1).join(' ');
            const preco = parseFloat(partes[partes.length - 1]) || 0; // Use float para decimais
            const id = `item-${idxSecao}-${idx}`;
            const imagem = secao.imagens ? secao.imagens[idx] : 'imagens/placeholder-pizza.jpg'; // Adicione "imagens" no JSON
            return `
            <div class="col-6 col-md-4">
              <div class="item-card p-3 text-center shadow-lg rounded">
                <strong>${nome}</strong><br>
                <span class="text-warning fs-5">R$ ${preco.toFixed(2)}</span><br>
                <div class="mt-2">
                  <button class="btn btn-sm btn-outline-warning" onclick="adicionarAoCarrinho('${id}', '${nome} - ${secao.tamanho}', ${preco})">
                    Adicionar
                  </button>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>`;
        container.appendChild(col);
    });
}
function adicionarAoCarrinho(id, nome, preco) {
    const itemExistente = carrinho.find(item => item.id === id);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ id, nome, preco, quantidade: 1 });
    }
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
    atualizarTotal();

    // MOSTRA TOAST DE SUCESSO
    mostrarToast(`${nome} adicionada ao carrinho! 🍕`);


    const floatingButton = document.querySelector('#floating-cart .btn');
    
    // Usamos setTimeout para garantir que o display: block seja processado antes do início da animação.
    setTimeout(() => {
        if (floatingButton) {
            // 1. Remove a classe para resetar a animação
            floatingButton.classList.remove('animate-pulse');
            // 2. Força o navegador a recalcular o estilo (essencial para reativar a animação)
            void floatingButton.offsetWidth; 
            // 3. Adiciona a classe para disparar a animação uma vez
            floatingButton.classList.add('animate-pulse');
            
            setTimeout(() => {
                floatingButton.classList.remove('animate-pulse');
            }, 800);
        }
    }, 10); // Atraso mínimo de 10ms
}


// Função para mostrar toast
function mostrarToast(mensagem) {
    const container = document.getElementById('toast-container');
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-white border-0 bg-success';
    toastEl.role = 'alert';
    toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-bold">
        ${mensagem}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();

    // Remove do DOM após esconder
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// Atualiza o badge do carrinho flutuante e visibilidade
function atualizarFloatingCart() {
    const totalItens = carrinho.reduce((sum, i) => sum + i.quantidade, 0);
    const floatingCart = document.getElementById('floating-cart');
    const badge = document.getElementById('floating-badge');

    if (totalItens > 0) {
        badge.textContent = totalItens;
        floatingCart.style.display = 'block';
    } else {
        floatingCart.style.display = 'none';
    }
}

// Esconde o floating cart quando o botão fixo está visível (scroll para baixo)
window.addEventListener('scroll', () => {
    const botaoFixo = document.querySelector('.mt-4.btn-warning'); 
    if (botaoFixo) {
        const rect = botaoFixo.getBoundingClientRect();
        const floatingCart = document.getElementById('floating-cart');
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            floatingCart.style.display = 'none';
        } else if (carrinho.reduce((s, i) => s + i.quantidade, 0) > 0) {
            floatingCart.style.display = 'block';
        }
    }
});

function removerDoCarrinho(id) {
    const item = carrinho.find(item => item.id === id);
    if (item.quantidade > 1) {
        item.quantidade -= 1;
    } else {
        carrinho = carrinho.filter(item => item.id !== id);
    }
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
    atualizarTotal();
    atualizarFloatingCart();
}

function atualizarCarrinho() {
    const lista = document.getElementById('carrinho-lista');
    const contador = document.getElementById('carrinho-contador');
    lista.innerHTML = '';
    let totalItens = 0;
    carrinho.forEach(item => {
        totalItens += item.quantidade;
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center bg-secondary';
        li.innerHTML = `
      ${item.nome} (x${item.quantidade}) - R$ ${(item.preco * item.quantidade).toFixed(2)}
      <div>
        <button class="btn btn-sm btn-outline-warning me-1" onclick="adicionarAoCarrinho('${item.id}', '${item.nome}', ${item.preco})">+</button>
        <button class="btn btn-sm btn-danger" onclick="removerDoCarrinho('${item.id}')">-</button>
      </div>
    `;
        lista.appendChild(li);
    });
    if (carrinho.length === 0) {
        lista.innerHTML = '<li class="list-group-item text-muted">Carrinho vazio</li>';
    }
    contador.textContent = totalItens;
    atualizarFloatingCart();
}

function atualizarTotal() {
    const totalItens = carrinho.reduce((s, i) => s + (i.preco * i.quantidade), 0);
    const total = totalItens + 5; // Frete
    document.getElementById('total').textContent = `Total: R$ ${total.toFixed(2)}`;
    document.getElementById('total').dataset.total = total;
    atualizarFloatingCart();
}

document.getElementById('form-pedido').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!grecaptcha.getResponse()) {
        alert('Por favor, confirme que você não é um robô.');
        return;
    }
    if (carrinho.length === 0) {
        alert('Adicione pelo menos um item ao carrinho.');
        return;
    }
    const nome = document.getElementById('nome').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const obs = document.getElementById('observacoes').value.trim();
    const pagamento = document.getElementById('pagamento').value;
    const total = document.getElementById('total').dataset.total;
    const itensLista = carrinho.map(i => `• ${i.nome} (x${i.quantidade}) - R$ ${(i.preco * i.quantidade).toFixed(2)}`).join('%0A');
    const mensagem = `*Novo Pedido - Abençoada Pizzaria*%0A%0A` +
        `*Nome:* ${nome}%0A` +
        `*Endereço:* ${endereco}%0A` +
        `*WhatsApp:* ${telefone}%0A%0A` +
        `*Itens:*%0A${itensLista}%0A%0A` +
        `*Frete:* R$ 5,00%0A` +
        `*Total:* R$ ${total}%0A%0A` +
        `*Pagamento:* ${pagamento}%0A` +
        `*Observações:* ${obs || 'Nenhuma'}`;
    // Envio via Formspree (mantido)
    const proxy = 'https://formspree.io/f/xldqwobk';
    const dados = {
        Nome: nome,
        WhatsApp: telefone,
        Endereço: endereco,
        Pedido: carrinho.map(i => `${i.nome} (x${i.quantidade}) - R$${(i.preco * i.quantidade).toFixed(2)}`).join(' | ') + ` | Total: R$${total}`,
        Observações: obs || 'Sem observações'
    };
    await fetch(proxy, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    // Abre WhatsApp
    window.open(`https://wa.me/5581991384055?text=${mensagem}`, '_blank');
    alert('Pedido enviado com sucesso! Caiu na planilha e estamos te chamando no WhatsApp 🍕');
    // Limpa tudo
    document.getElementById('form-pedido').reset();
    carrinho = [];
    localStorage.removeItem('carrinho');
    atualizarCarrinho();
    atualizarTotal();
    grecaptcha.reset();
    bootstrap.Modal.getInstance(document.getElementById('carrinhoModal')).hide(); // Fecha modal
    atualizarFloatingCart();
});