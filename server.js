const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Inicialização do Banco de Dados
db.defaults({
  clientes: [],
  vendedores: [],
  materiais: [],
  orcamentos: [],
  vendas: [],
  pedidos: [],
  osProducao: [],
  contasReceber: [],
  contasPagar: [],
  empresas: [],
  usuarios: [],
  produtos: [],
  chapas: []
}).write();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

const tables = [
  'clientes', 'vendedores', 'materiais', 'orcamentos', 
  'vendas', 'pedidos', 'osProducao', 'contasReceber', 
  'contasPagar', 'empresas', 'usuarios', 'produtos', 'chapas'
];

tables.forEach(table => {
  // Listar todos
  app.get(`/api/${table}`, (req, res) => {
    const data = db.get(table).value();
    res.json(data);
  });

  // Obter um por ID
  app.get(`/api/${table}/:id`, (req, res) => {
    const item = db.get(table).find({ id: parseInt(req.params.id) || req.params.id }).value();
    res.json(item);
  });

  // Criar
  app.post(`/api/${table}`, (req, res) => {
    const tableData = db.get(table).value();
    const nextId = tableData.length > 0 ? Math.max(...tableData.map(i => parseInt(i.id) || 0)) + 1 : 1;
    const newItem = { id: nextId, ...req.body };
    db.get(table).push(newItem).write();
    res.json(newItem);
  });

  // Atualizar
  app.put(`/api/${table}/:id`, (req, res) => {
    const id = parseInt(req.params.id) || req.params.id;
    db.get(table).find({ id }).assign(req.body).write();
    res.json({ id, ...req.body });
  });

  // Deletar
  app.delete(`/api/${table}/:id`, (req, res) => {
    const id = parseInt(req.params.id) || req.params.id;
    db.get(table).remove({ id }).write();
    res.json({ success: true });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
