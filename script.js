let cardapio = [];
let carrinho = [];

fetch('cardapio.json')
  .then(r => r.json())
  .then(data => {
    cardapio = data;
    renderizarCardapio();
  });

function renderizarCardapio() {
  const container = document.getElementById('cardapio-container');
  container.innerHTML = '';

  cardapio.forEach((secao, idxSecao) => {
    const col = document.createElement('div');
    col.className = 'col-12';
    col.innerHTML = `
      <h3 class="text-center my-4">${secao.tamanho}</h3>
      <div class="row g-3">
        ${secao.itens.map((item, idx) => {
          const partes = item.split(' ');
          const nome = partes.slice(0, -1).join(' ');
          const preco = parseInt(partes[partes.length - 1]) || 0;
          const id = `item-${idxSecao}-${idx}`;
          return `
            <div class="col-6 col-md-4">
              <div class="item-card p-3 text-center">
                <strong>${nome}</strong><br>
                <span class="text-warning fs-5">R$ ${preco},00</span><br>
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
  carrinho.push({id, nome, preco});
  atualizarCarrinho();
  atualizarTotal();
}

function removerDoCarrinho(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
  atualizarTotal();
}

function atualizarCarrinho() {
  const lista = document.getElementById('carrinho-lista');
  lista.innerHTML = '';
  carrinho.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      ${item.nome} - R$ ${item.preco},00
      <button class="btn btn-sm btn-danger" onclick="removerDoCarrinho(${index})">X</button>
    `;
    lista.appendChild(li);
  });
  if (carrinho.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-muted">Carrinho vazio</li>';
  }
}

function atualizarTotal() {
  const totalItens = carrinho.reduce((s, i) => s + i.preco, 0);
  const total = totalItens + 5; // frete
  document.getElementById('total').textContent = `Total: R$ ${total},00`;
  document.getElementById('total').dataset.total = total;
}

document.getElementById('form-pedido').addEventListener('submit', function(e) {
  e.preventDefault();

  if (!grecaptcha.getResponse()) {
    alert('Por favor, confirme que você não é um robô.');
    return;
  }

  if (carrinho.length === 0) {
    alert('Adicione itens ao carrinho antes de enviar.');
    return;
  }

  const nome = document.getElementById('nome').value;
  const endereco = document.getElementById('endereco').value;
  const telefone = document.getElementById('telefone').value;
  const obs = document.getElementById('observacoes').value;
  const pagamento = document.getElementById('pagamento').value;

  const itensTexto = carrinho.map(i => `• ${i.nome} - R$ ${i.preco},00`).join('%0A');
  const total = document.getElementById('total').dataset.total;

  const mensagem = `*Novo Pedido - Abençoada Pizzaria*%0A%0A` +
    `*Nome:* ${nome}%0A` +
    `*Endereço:* ${endereco}%0A` +
    `*WhatsApp:* ${telefone}%0A%0A` +
    `*Itens:*%0A${itensTexto}%0A%0A` +
    `*Frete:* R$ 5,00%0A` +
    `*Total:* R$ ${total},00%0A%0A` +
    `*Pagamento:* ${pagamento}%0A` +
    `*Observações:* ${obs || 'Nenhuma'}`;

  // Envia pro Google Sheets (substitua os entry.XXXXXX pelos IDs reais do seu form)
  const formData = new FormData();
  formData.append('entry.123456789', nome);      // ← troque pelos seus IDs
  formData.append('entry.987654321', telefone);
  formData.append('entry.111222333', endereco);
  formData.append('entry.444555666', carrinho.map(i => `${i.nome} - R$${i.preco}`).join(' | ') + ' | Total: R$' + total);
  formData.append('entry.777888999', obs);

  fetch('https://docs.google.com/forms/d/e/SEU_FORM_ID_AQUI/formResponse', {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  });

  // Abre WhatsApp
  const numeroPizzaria = '5581979067586'; // ex: 5581999999999
  window.open(`https://wa.me/${numeroPizzaria}?text=${mensagem}`, '_blank');

  // Limpa carrinho após envio (opcional)
  carrinho = [];
  atualizarCarrinho();
  atualizarTotal();
});