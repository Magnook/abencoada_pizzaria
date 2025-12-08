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

  const itensTexto = carrinho.map(i => `• ${i.nome} - R$ ${i.preco},00`).join('\n');
  const total = document.getElementById('total').dataset.total;

  const mensagem = `*Novo Pedido - Abençoada Pizzaria*\n\n` +
    `*Nome:* ${nome}\n` +
    `*Endereço:* ${endereco}\n` +
    `*WhatsApp:* ${telefone}\n\n` +
    `*Itens:*\n${itensTexto}\n\n` +
    `*Frete:* R$ 5,00\n` +
    `*Total:* R$ ${total},00\n\n` +
    `*Pagamento:* ${pagamento}\n` +
    `*Observações:* ${obs || 'Nenhuma'}`;

  // Envia pro Google Sheets (ainda placeholder - vamos configurar depois)
  const formData = new FormData();
  formData.append('entry.1171888313', nome);      // ← troque pelos seus IDs
  formData.append('entry.1825518668', telefone);
  formData.append('entry.1876354563', endereco);
  formData.append('entry.243231740', itensTexto.replace(/\n/g, ' | ') + ' | Total: R$' + total);
  formData.append('entry.1708352740', obs);

  fetch('https://docs.google.com/forms/d/e/1FAIpQLScRWk5OQXgILmc4Y1HPLHs5Idb8KGypEKTYl8yyotIb87afzQ/formResponse', {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  }).then(() => {
    alert('Pedido enviado! Abrindo WhatsApp...');
  }).catch(() => {
    alert('Erro no envio para planilha. Mas vamos pro WhatsApp mesmo assim!');
  });

  // Abre WhatsApp (CORREÇÃO: use location.href + seu número real)
  const numeroPizzaria = '5581991384055'; // ← COLE O NÚMERO AQUI! Ex: 55 + DDD + número sem traços
  const msgEncoded = encodeURIComponent(mensagem);
  window.open(`https://wa.me/${numeroPizzaria}?text=${msgEncoded}`, '_blank');

  // Limpa form e carrinho
  document.getElementById('form-pedido').reset();
  carrinho = [];
  atualizarCarrinho();
  atualizarTotal();
  grecaptcha.reset(); // Limpa o reCAPTCHA
});