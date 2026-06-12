document.addEventListener("DOMContentLoaded", () => {
    const catalogoMaquinasFixo = [
        { modelo: "Trator John Deere 6100E (100 CV)", cidade: "sorriso", preco: 250, ano: "2023" },
        { modelo: "Trator Case IH Puma 230 (234 CV)", cidade: "uberlandia", preco: 420, ano: "2022" },
        { modelo: "Colheitadeira New Holland CR 7.90", cidade: "rioverde", preco: 850, ano: "2021" }
    ];

    const catalogoVagasFixo = [
        { titulo: "Operador de Colheitadeira S700", empresa: "Fazenda Progresso", cidade: "sorriso", salario: "R$ 3.800,00", requisitos: "Experiência com AMS John Deere." },
        { titulo: "Técnico Agrícola de Campo", empresa: "BioInsumos Cerrado", cidade: "uberlandia", salario: "R$ 4.500,00", requisitos: "Registro CFTA ativo." },
        { titulo: "Tratorista de Plantio", empresa: "Agropecuária Vale Verde", cidade: "rioverde", salario: "R$ 3.100,00", requisitos: "Experiência com plantio a vácuo." }
    ];

    const painelListaHistorico = document.getElementById("lista-historico");
    const btnLimparHist = document.getElementById("btn-limpar-historico");

    function salvarAcaoNoHistorico(descricaoAcao) {
        let historicoAtual = JSON.parse(localStorage.getItem("historicoAgro")) || [];
        const dataHora = new Date().toLocaleDateString('pt-BR') + " " + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        historicoAtual.unshift({ acao: descricaoAcao, tempo: dataHora });
        if (historicoAtual.length > 4) historicoAtual.pop();
        localStorage.setItem("historicoAgro", JSON.stringify(historicoAtual));
        renderizarHistoricoNaTela();
    }

    function renderizarHistoricoNaTela() {
        if (!painelListaHistorico) return;
        const historicoAtual = JSON.parse(localStorage.getItem("historicoAgro")) || [];
        if (historicoAtual.length === 0) {
            painelListaHistorico.innerHTML = `<p class="aviso-vazio">Nenhuma atividade registrada hoje.</p>`;
            if (btnLimparHist) btnLimparHist.style.display = "none";
            return;
        }
        painelListaHistorico.innerHTML = historicoAtual.map(item => `
            <div class="item-historico"><span>${item.acao}</span><small>⏱️ ${item.tempo}</small></div>
        `).join("");
        if (btnLimparHist) btnLimparHist.style.display = "block";
    }

    btnLimparHist?.addEventListener("click", () => {
        localStorage.removeItem("historicoAgro");
        renderizarHistoricoNaTela();
    });

    const campoFiltroInsumo = document.getElementById("filtro-insumo");
    const selectInsumos = document.getElementById("insumo-selecionado");
    campoFiltroInsumo?.addEventListener("input", (e) => {
        const termoBusca = e.target.value.toLowerCase();
        const opcoes = selectInsumos.getElementsByTagName("option");
        for (let i = 1; i < opcoes.length; i++) {
            opcoes[i].style.display = opcoes[i].text.toLowerCase().includes(termoBusca) ? "block" : "none";
        }
    });

    // SISTEMA CLIMÁTICO REPARADO
    document.getElementById("form-alertas")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const local = document.getElementById("regiao").value;
        const cult = document.getElementById("cultura").value;
        const num = document.getElementById("contato").value;
        
        salvarAcaoNoHistorico(`Boletim Clima: ${cult}`);
        mostrarMensagem(`⚠️ Diagnóstico Gerado! Redirecionando para o seu WhatsApp...`);
        
        const textoMsg = `AgroFácil PRO — Alerta Rural Digital:\n📍 Região de Análise: ${local}\n🌱 Cultura Informada: ${cult}\n📋 Diagnóstico Técnico Climático e Sanitário solicitado com sucesso.`;
        setTimeout(() => { window.open(`https://api.whatsapp.com/send?phone=55${num}&text=${encodeURIComponent(textoMsg)}`, '_blank'); }, 1200);
        document.getElementById("form-alertas").reset();
    });

    const popup = document.getElementById("popup-notificacao");
    const popupTexto = document.getElementById("popup-texto");
    function mostrarMensagem(msg) { if(popup && popupTexto) { popupTexto.innerHTML = msg; popup.hidden = false; } }
    document.getElementById("fechar-popup")?.addEventListener("click", () => { if(popup) popup.hidden = true; });

    const containerVisivelMaq = document.getElementById("lista-maquinas");
    const containerOcultoMaq = document.getElementById("maquinas-ocultas");
    const btnMaisMaq = document.getElementById("btn-ver-mais-maquinas");

    function buscarMaquinasNacionais(cidadeDigitada) {
        if (!containerVisivelMaq || !containerOcultoMaq) return;
        containerVisivelMaq.innerHTML = ""; containerOcultoMaq.innerHTML = "";
        const termo = cidadeDigitada.trim().toLowerCase();
        if (!termo) { containerVisivelMaq.innerHTML = `<p class="aviso-vazio">Busque por qualquer cidade acima para listar frotas.</p>`; return; }

        let resultado = catalogoMaquinasFixo.filter(m => m.cidade === termo);
        if (resultado.length === 0) {
            const nomeFormatado = cidadeDigitada.charAt(0).toUpperCase() + cidadeDigitada.slice(1);
            resultado = [
                { modelo: "Trator Massey Ferguson MF 4707", cidade: nomeFormatado, preco: 210, ano: "2023" },
                { modelo: "Pulverizador Jacto Advance 3000", cidade: nomeFormatado, preco: 380, ano: "2022" }
            ];
        }

        resultado.forEach((m, i) => {
            const layoutItem = `
                <div class="maquina-item">
                    <h3>${m.modelo}</h3>
                    <p>📍 Frota em: <strong>${m.cidade}</strong> — Ano: ${m.ano}</p>
                    <p class="preview-preco">R$ ${m.preco} / hora</p>
                    <div class="agro-form">
                        <input type="number" id="h-maq-${i}" placeholder="Quantas horas?" min="1">
                        <button class="btn-acao-alugar" data-maq="${m.modelo}" data-cid="${m.cidade}" data-id="h-maq-${i}">Alugar Equipamento</button>
                    </div>
                </div>`;
            if(i === 0) containerVisivelMaq.innerHTML += layoutItem;
            else containerOcultoMaq.innerHTML += layoutItem;
        });
        if(resultado.length > 1 && btnMaisMaq) btnMaisMaq.style.display = "block";
        vincularEventosAluguel();
    }

    function vincularEventosAluguel() {
        document.querySelectorAll(".btn-acao-alugar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const mq = e.target.getAttribute("data-maq");
                const cd = e.target.getAttribute("data-cid");
                const id = e.target.getAttribute("data-id");
                const hs = document.getElementById(id).value;
                if(!hs || hs <= 0) { alert("Informe as horas necessárias!"); return; }
                salvarAcaoNoHistorico(`Locação: ${mq}`);
                window.open(`https://api.whatsapp.com/send?text=Solicito locação de ${mq} em ${cd} por ${hs} horas.`, '_blank');
            });
        });
    }

    document.getElementById("btn-filtrar-maquinas")?.addEventListener("click", () => {
        buscarMaquinasNacionais(document.getElementById("busca-maquina-cidade").value);
    });

    document.getElementById("form-compras-coletivas")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const pr = document.getElementById("insumo-selecionado").value;
        const qt = document.getElementById("qtd-insumo").value;
        salvarAcaoNoHistorico(`Lote Coletivo: ${qt}x`);
        mostrarMensagem(`🛒 Reserva de Lote Efetuada!`);
    });

    buscarMaquinasNacionais("");
    renderizarHistoricoNaTela();
});