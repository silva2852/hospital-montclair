const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../frontend")));

const DB_FILE = path.join(__dirname, "db.json");

// =====================================================
// BANCO DE DADOS
// =====================================================

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return {
      usuarios: [],
      pacientes: [],
      triagens: [],
      consultas: [],
      internacoes: [],
      leitos: [
        {
          numero: "101",
          tipo: "Apartamento",
          status: "disponivel",
          paciente: null
        },
        {
          numero: "102",
          tipo: "Apartamento",
          status: "disponivel",
          paciente: null
        },
        {
          numero: "103",
          tipo: "Apartamento",
          status: "disponivel",
          paciente: null
        },
        {
          numero: "201",
          tipo: "Leito",
          status: "disponivel",
          paciente: null
        },
        {
          numero: "202",
          tipo: "Leito",
          status: "disponivel",
          paciente: null
        },
        {
          numero: "203",
          tipo: "Leito",
          status: "disponivel",
          paciente: null
        }
      ],
      tv_chamada: null,
      tv_historico: []
    };
  }

  const db = JSON.parse(fs.readFileSync(DB_FILE));

  // Garante que as estruturas novas existam
  if (!db.tv_chamada) {
    db.tv_chamada = null;
  }

  if (!db.tv_historico) {
    db.tv_historico = [];
  }

  if (!db.consultas) {
    db.consultas = [];
  }

  if (!db.internacoes) {
    db.internacoes = [];
  }

  // Se o banco antigo ainda não tiver leitos,
  // cria os leitos automaticamente.
  if (!db.leitos) {
    db.leitos = [
      {
        numero: "101",
        tipo: "Apartamento",
        status: "disponivel",
        paciente: null
      },
      {
        numero: "102",
        tipo: "Apartamento",
        status: "disponivel",
        paciente: null
      },
      {
        numero: "103",
        tipo: "Apartamento",
        status: "disponivel",
        paciente: null
      },
      {
        numero: "201",
        tipo: "Leito",
        status: "disponivel",
        paciente: null
      },
      {
        numero: "202",
        tipo: "Leito",
        status: "disponivel",
        paciente: null
      },
      {
        numero: "203",
        tipo: "Leito",
        status: "disponivel",
        paciente: null
      }
    ];
  }

  return db;
}

function writeDB(data) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(data, null, 2)
  );
}

// =====================================================
// LOGIN
// =====================================================

app.post("/login", (req, res) => {
  const db = readDB();

  const user = db.usuarios.find(
    u =>
      u.usuario === req.body.usuario &&
      u.senha === req.body.senha
  );

  if (!user) {
    return res.status(401).json({
      erro: "Login inválido"
    });
  }

  res.json(user);
});

// =====================================================
// ATENDIMENTO - CADASTRAR PACIENTE
// =====================================================

app.post("/atendimento", (req, res) => {
  const db = readDB();

  const paciente = {
    id: Date.now(),
    nome: req.body.nome,
    cpf: req.body.cpf,
    tipo: req.body.tipo,
    status: "triagem",
    createdAt: new Date()
  };

  db.pacientes.push(paciente);

  writeDB(db);

  res.json(paciente);
});

// =====================================================
// LISTAR PACIENTES
// =====================================================

app.get("/pacientes", (req, res) => {
  const db = readDB();

  res.json(db.pacientes);
});

// =====================================================
// TRIAGEM
// =====================================================

app.post("/triagem", (req, res) => {
  const db = readDB();

  let risco = req.body.risco;

  if (req.body.temperatura >= 39) {
    risco = "vermelho";
  } else if (req.body.temperatura >= 38) {
    risco = "amarelo";
  } else if (!risco) {
    risco = "verde";
  }

  const triagem = {
    id: Date.now(),
    nome: req.body.nome,
    sintoma: req.body.sintoma,
    temperatura: req.body.temperatura,
    alergia: req.body.alergia,
    observacao: req.body.observacao,
    risco,
    status: "aguardando_medico",
    createdAt: new Date()
  };

  db.triagens.push(triagem);

  writeDB(db);

  res.json(triagem);
});

// =====================================================
// LISTAR TRIAGENS
// =====================================================

app.get("/triagens", (req, res) => {
  const db = readDB();

  res.json(db.triagens);
});

// =====================================================
// MÍDIA INDOOR - TV
// =====================================================

app.post("/tv/chamar", (req, res) => {
  const db = readDB();

  const chamada = {
    id: Date.now().toString(),
    localTipo: req.body.localTipo,
    localNumero: req.body.localNumero,
    paciente: req.body.paciente,
    hora: new Date().toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    )
  };

  db.tv_chamada = chamada;

  db.tv_historico.unshift(chamada);

  if (db.tv_historico.length > 5) {
    db.tv_historico.pop();
  }

  writeDB(db);

  res.json(chamada);
});

// =====================================================
// CONSULTAR CHAMADA DA TV
// =====================================================

app.get("/tv/chamada", (req, res) => {
  const db = readDB();

  res.json({
    chamada: db.tv_chamada,
    historico: db.tv_historico
  });
});

// =====================================================
// LISTA DE MEDICAÇÕES
// =====================================================

app.get("/lista-medicacoes", (req, res) => {
  res.json([
    "Dipirona",
    "Paracetamol",
    "Ibuprofeno",
    "Amoxicilina",
    "Azitromicina",
    "Loratadina",
    "Omeprazol",
    "Buscopan",
    "Dramin",
    "Soro fisiológico"
  ]);
});

// =====================================================
// CONSULTA
// =====================================================

app.post("/consulta", (req, res) => {
  const db = readDB();

  const consulta = {
    id: Date.now(),
    paciente: req.body.paciente,
    diagnostico: req.body.diagnostico,
    medicacao: req.body.medicacao,
    obs: req.body.obs,
    createdAt: new Date()
  };

  db.consultas.push(consulta);

  writeDB(db);

  res.json(consulta);
});

// =====================================================
// MEDICAÇÕES / CONSULTAS
// =====================================================

app.get("/medicacoes", (req, res) => {
  const db = readDB();

  res.json(db.consultas);
});

// =====================================================
// INTERNAÇÃO
// =====================================================

// LISTAR TODOS OS LEITOS
app.get("/leitos", (req, res) => {
  const db = readDB();

  res.json(db.leitos);
});

// =====================================================
// REALIZAR INTERNAÇÃO
// =====================================================

app.post("/internacao", (req, res) => {
  const db = readDB();

  const paciente = req.body.paciente;
  const numeroLeito = String(req.body.leito);

  // Verifica se recebeu paciente
  if (!paciente || !paciente.nome) {
    return res.status(400).json({
      erro: "Paciente não informado."
    });
  }

  // Verifica se recebeu leito
  if (!numeroLeito) {
    return res.status(400).json({
      erro: "Leito não informado."
    });
  }

  // Procura o leito
  const leito = db.leitos.find(
    l => String(l.numero) === numeroLeito
  );

  // Se não encontrou
  if (!leito) {
    return res.status(404).json({
      erro: "Leito não encontrado."
    });
  }

  // Se já estiver ocupado
  if (leito.status === "ocupado") {
    return res.status(400).json({
      erro: "Este leito já está ocupado."
    });
  }

  // Ocupa o leito
  leito.status = "ocupado";

  leito.paciente = {
    nome: paciente.nome,
    id: paciente.id || null,
    cpf: paciente.cpf || null
  };

  leito.dataInternacao = new Date();

  // Cria registro da internação
  const internacao = {
    id: Date.now(),
    paciente: paciente,
    leito: leito.numero,
    tipoLeito: leito.tipo,
    dataInternacao: new Date(),
    status: "internado"
  };

  db.internacoes.push(internacao);

  writeDB(db);

  res.json({
    sucesso: true,
    mensagem:
      "Paciente internado com sucesso!",
    internacao: internacao,
    leito: leito
  });
});

// =====================================================
// LISTAR INTERNAÇÕES
// =====================================================

app.get("/internacoes", (req, res) => {
  const db = readDB();

  res.json(db.internacoes);
});

// =====================================================
// LIBERAR LEITO
// =====================================================

app.post("/leitos/:numero/liberar", (req, res) => {
  const db = readDB();

  const numero = String(req.params.numero);

  const leito = db.leitos.find(
    l => String(l.numero) === numero
  );

  if (!leito) {
    return res.status(404).json({
      erro: "Leito não encontrado."
    });
  }

  if (leito.status === "disponivel") {
    return res.status(400).json({
      erro: "Este leito já está disponível."
    });
  }

  const pacienteAnterior = leito.paciente;

  leito.status = "disponivel";
  leito.paciente = null;
  leito.dataInternacao = null;

  // Atualiza a internação correspondente
  const internacao = db.internacoes.find(
    i =>
      String(i.leito) === numero &&
      i.status === "internado"
  );

  if (internacao) {
    internacao.status = "alta";
    internacao.dataAlta = new Date();
  }

  writeDB(db);

  res.json({
    sucesso: true,
    mensagem: "Leito liberado com sucesso!",
    paciente: pacienteAnterior,
    leito: leito
  });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
  console.log(
    `🏥 Hospital Montclair rodando em http://localhost:${PORT}`
  );
});
