
const btnAlternarTema = document.getElementById('btnAlternarTema');
const body = document.body;

const temaSalvo = localStorage.getItem('tema');
if (temaSalvo === 'dark') {
    body.classList.add('dark-mode');
    btnAlternarTema.innerText = '☀️';
}

btnAlternarTema.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('tema', 'dark');
        btnAlternarTema.innerText = '☀️';
    } else {
        localStorage.setItem('tema', 'light');
        btnAlternarTema.innerText = '🌙';
    }
});

// --- 2. CONTROLE DE MODAIS ---
const modalAdicionar = document.getElementById('modalTransacao');
const modalEditar = document.getElementById('modalEditar');
const modalExcluir = document.getElementById('modalExcluir');
const btnAbrir = document.getElementById('btnAbrir');

if (btnAbrir) {
    btnAbrir.addEventListener('click', () => {
        modalAdicionar.style.display = 'flex';
    });
}

function fecharModais() {
    modalAdicionar.style.display = 'none';
    modalEditar.style.display = 'none';
    modalExcluir.style.display = 'none';
}

window.addEventListener('click', (event) => {
    if (event.target === modalAdicionar || event.target === modalEditar || event.target === modalExcluir) {
        fecharModais();
    }
});

function abrirModalEditar(id, descricao, valor, tipo, categoria) {
    document.getElementById('editDescricao').value = descricao;
    document.getElementById('editValor').value = valor;
    document.getElementById('editTipo').value = tipo;
    document.getElementById('editCategoria').value = categoria;
    
    document.getElementById('formEditar').action = `/editar/${id}`;
    modalEditar.style.display = 'flex';
}

function abrirModalExcluir(id, descricao) {
    document.getElementById('excluirNome').innerText = descricao;
    document.getElementById('linkConfirmarExclusao').href = `/deletar/${id}`;
    modalExcluir.style.display = 'flex';
}

function mostrarLoading(form) {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function ativarLoadingExclusao(element) {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

fetch('/api/dashboard')
    .then(response => response.json())
    .then(data => {
        // Gráfico de Receitas
        const ctxReceitas = document.getElementById('chartReceitas').getContext('2d');
        new Chart(ctxReceitas, {
            type: 'doughnut',
            data: {
                labels: data.receitas_por_categoria.labels,
                datasets: [{
                    data: data.receitas_por_categoria.values,
                    backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#6f42c1']
                }]
            },
            options: { responsive: true }
        });

        // Gráfico de Despesas
        const ctxDespesas = document.getElementById('chartDespesas').getContext('2d');
        new Chart(ctxDespesas, {
            type: 'doughnut',
            data: {
                labels: data.despesas_por_categoria.labels,
                datasets: [{
                    data: data.despesas_por_categoria.values,
                    backgroundColor: ['#dc3545', '#fd7e14', '#e83e8c', '#6c757d']
                }]
            },
            options: { responsive: true }
        });

        // Gráfico de Balanço Geral
        const ctxBalanco = document.getElementById('chartBalanço').getContext('2d');
        const corSaldo = data.saldo >= 0 ? '#28a745' : '#dc3545';
        const labelSaldo = data.saldo >= 0 ? 'Economia (Saldo Positivo)' : 'Prejuízo (Saldo Negativo)';

        new Chart(ctxBalanco, {
            type: 'bar',
            data: {
                labels: ['Total Receitas', 'Total Despesas', labelSaldo],
                datasets: [{
                    label: 'Valores em R$',
                    data: [data.total_receitas, data.total_despesas, data.saldo],
                    backgroundColor: ['#28a745', '#dc3545', corSaldo]
                }]
            },
            options: { 
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar dados do dashboard:', error));