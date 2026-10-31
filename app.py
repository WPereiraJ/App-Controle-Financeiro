import os
from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from collections import defaultdict
from datetime import datetime

# Carrega as variáveis do arquivo .env
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from database import db
db.init_app(app)

# Modelo da Transação
class Transacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(100), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    tipo = db.Column(db.String(10), nullable=False) # 'receita' ou 'despesa'
    categoria = db.Column(db.String(50), nullable=False)
    data = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    transacoes = Transacao.query.order_by(Transacao.data.desc()).all()
    return render_template('index.html', transacoes=transacoes)

@app.route('/adicionar', methods=['POST'])
def adicionar():
    descricao = request.form.get('descricao')
    valor = float(request.form.get('valor'))
    tipo = request.form.get('tipo')
    categoria = request.form.get('categoria')

    nova_transacao = Transacao(
        descricao=descricao, 
        valor=valor, 
        tipo=tipo, 
        categoria=categoria
    )
    
    db.session.add(nova_transacao)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/editar/<int:id>', methods=['POST'])
def editar(id):
    transacao = Transacao.query.get_or_404(id)
    
    transacao.descricao = request.form.get('descricao')
    transacao.valor = float(request.form.get('valor'))
    transacao.tipo = request.form.get('tipo')
    transacao.categoria = request.form.get('categoria')
    
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/deletar/<int:id>')
def deletar(id):
    transacao = Transacao.query.get_or_404(id)
    db.session.delete(transacao)
    db.session.commit()
    return redirect(url_for('index'))


# --- API DO DASHBOARD ---
@app.route('/api/dashboard')
def api_dashboard():
    # Mantém a mesma ordenação se necessário para consistência
    transacoes = Transacao.query.order_by(Transacao.data.desc()).all()
    
    total_receitas = 0
    total_despesas = 0
    
    cat_receitas = defaultdict(float)
    cat_despesas = defaultdict(float)
    
    for t in transacoes:
        if t.tipo == 'receita':
            total_receitas += t.valor
            cat_receitas[t.categoria] += t.valor
        elif t.tipo == 'despesa':
            total_despesas += t.valor
            cat_despesas[t.categoria] += t.valor
            
    saldo = total_receitas - total_despesas
    
    return jsonify({
        'total_receitas': total_receitas,
        'total_despesas': total_despesas,
        'saldo': saldo,
        'receitas_por_categoria': {
            'labels': list(cat_receitas.keys()),
            'values': list(cat_receitas.values())
        },
        'despesas_por_categoria': {
            'labels': list(cat_despesas.keys()),
            'values': list(cat_despesas.values())
        }
    })

if __name__ == '__main__':
    app.run(debug=True)