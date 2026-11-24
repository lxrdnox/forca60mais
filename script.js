/* Força 60+ · comportamento do site */
const $ = id => document.getElementById(id);
const store = {
    get(k, d) {
        try {
            const v = localStorage.getItem(k);
            return v ? JSON.parse(v) : d
        } catch (e) {
            return d
        }
    },
    set(k, v) {
        try {
            localStorage.setItem(k, JSON.stringify(v))
        } catch (e) {}
    }
};

function ir(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
    document.querySelectorAll('nav.bn button').forEach(b => {
        const a = b.dataset.s === id;
        b.classList.toggle('on', a);
        a ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')
    });
    window.scrollTo(0, 0);
    if (window.speechSynthesis) parar();
    const sc = $(id),
        h = sc.querySelector('h1,h2');
    if (h) {
        h.setAttribute('tabindex', '-1');
        h.focus({
            preventScroll: true
        });
        document.title = h.textContent + ' | Força 60+'
    }
}

function anunciar(m) {
    const a = $('anuncio');
    a.textContent = '';
    setTimeout(() => a.textContent = m, 60)
}
let falando = false;

function parar() {
    speechSynthesis.cancel();
    falando = false;
    $('ouvir').setAttribute('aria-pressed', 'false');
    $('ouvir').textContent = '🔊 Ouvir página'
}

function ouvir() {
    if (!('speechSynthesis' in window)) {
        anunciar('Seu navegador não tem leitura em voz alta. Use o leitor de tela do aparelho.');
        return
    }
    if (falando) {
        parar();
        return
    }
    const t = document.querySelector('.screen.on').innerText.replace(/\s+/g, ' ');
    const partes = t.match(/[^.!?:]+[.!?:]?/g) || [t];
    falando = true;
    $('ouvir').setAttribute('aria-pressed', 'true');
    $('ouvir').textContent = '⏹ Parar leitura';
    partes.forEach((x, i) => {
        const u = new SpeechSynthesisUtterance(x.trim());
        u.lang = 'pt-BR';
        u.rate = .9;
        if (i === partes.length - 1) u.onend = parar;
        speechSynthesis.speak(u)
    })
}
let fs = store.get('fs', 100);

function fonte(d) {
    fs = Math.min(150, Math.max(90, fs + d));
    document.documentElement.style.setProperty('--fs', fs + '%');
    store.set('fs', fs);
    if (d) anunciar('Tamanho do texto: ' + fs + ' por cento')
}
fonte(0);

function contraste(on) {
    const h = document.documentElement,
        a = typeof on === 'boolean' ? on : h.dataset.contrast !== 'alto';
    a ? h.dataset.contrast = 'alto' : delete h.dataset.contrast;
    $('ctr').setAttribute('aria-pressed', a);
    store.set('ct', a);
    if (typeof on !== 'boolean') anunciar(a ? 'Alto contraste ativado' : 'Alto contraste desativado')
}
contraste(store.get('ct', false));

const perguntas = ['Algum médico já disse que você tem problema de coração ou pressão alta não controlada?', 'Você sente dor ou aperto no peito ao fazer esforço ou em repouso?', 'Você teve tontura que quase o derrubou, ou desmaiou, nos últimos 12 meses?', 'Você caiu uma ou mais vezes no último ano?', 'Você tem osteoporose, artrose ou dor articular que piora com movimento?', 'Você toma remédios para o coração ou para a pressão?', 'Você tem algum outro motivo que o impeça de fazer exercícios?'];
$('triagem').innerHTML = perguntas.map((p, i) => `<div class="q"><fieldset><legend>${i+1}. ${p}</legend><label class="opt"><input type="radio" name="q${i}" value="s"> Sim</label><label class="opt"><input type="radio" name="q${i}" value="n"> Não</label></fieldset></div>`).join('');

function triar() {
    const v = perguntas.map((_, i) => (document.querySelector(`input[name=q${i}]:checked`) || {}).value);
    const r = $('res');
    r.hidden = false;
    if (v.includes(undefined)) {
        r.className = 'result warn';
        r.innerHTML = '<strong>Faltam respostas.</strong> Responda todas as perguntas para ver o resultado.'
    } else if (v.includes('s')) {
        r.className = 'result warn';
        r.innerHTML = `<strong>Converse com seu médico antes de começar.</strong><p style="margin-top:.5rem">Você respondeu “sim” em ${v.filter(x=>x==='s').length} pergunta(s). Isso não impede que você treine, mas o médico pode indicar cuidados e adaptações. Leve esta lista na consulta.</p>`
    } else {
        r.className = 'result';
        r.innerHTML = '<strong>Nenhum alerta nesta triagem.</strong><p style="margin-top:.5rem">Mesmo assim, procure um profissional de educação física para avaliar você e montar um treino individual.</p>'
    }
    r.focus()
}

const svgs = {
    cad: '<path d="M19 54h40M25 54V39h29v15M30 39V25h19v14" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="15" r="7" fill="#C5D9C9" stroke="currentColor" stroke-width="3"/><path d="M40 23v12m0 0-10 9m10-9 10 9" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    joe: '<path d="M20 56h40M27 56V34h26v22" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="17" r="7" fill="#C5D9C9" stroke="currentColor" stroke-width="3"/><path d="M40 25v16m0 0-9 8m9-8 13 4 5 9" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
    ros: '<circle cx="40" cy="17" r="7" fill="#C5D9C9" stroke="currentColor" stroke-width="3"/><path d="M40 25v18m0-10-13 11m13-11 13 11M27 44l-3-12m29 12 3-12M33 58h14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    rem: '<circle cx="40" cy="15" r="7" fill="#C5D9C9" stroke="currentColor" stroke-width="3"/><path d="M40 23v27m0-17-16 8m16-8 16 8M24 41l-7-7m39 7 7-7M31 59h18" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    cal: '<circle cx="40" cy="15" r="7" fill="#C5D9C9" stroke="currentColor" stroke-width="3"/><path d="M40 23v18m0-10-13 10m13-10 12 8m-12 2-10 17m10-17 10 17" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M17 63h46M61 24v39" stroke="#B18A50" stroke-width="3" stroke-linecap="round"/>',
    par: '<circle cx="30" cy="18" r="7" fill="#C5D9C9" stroke="currentColor" stroke-width="3"/><path d="M30 26l8 18m0 0-14 14m14-14 8 14M62 12v56M40 34l18-4" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>'
};
const ex = [
    ['cad', 'pernas', 'Sentar e levantar da cadeira', 'Movimento funcional de pernas e quadris, parecido com o que fazemos todo dia.', ['Pernas', 'Funcional'], 'Pode contribuir para a força das pernas e para tarefas como levantar-se de uma cadeira.', 'Levantar e voltar a sentar, de forma controlada, conforme orientação individual.', 'Usar cadeira firme e estável. A necessidade de apoio deve ser avaliada pelo profissional.', 'Não fazer sem avaliação se houver dor, tontura ou dificuldade de equilíbrio. Parar diante de desconforto incomum.'],
    ['joe', 'pernas', 'Extensão de joelhos', 'Fortalece a parte da frente das coxas, usada para caminhar e levantar.', ['Pernas', 'Sentado'], 'Pode auxiliar no fortalecimento do quadríceps.', 'Sentado, estender o joelho de forma lenta e controlada.', 'A amplitude e a resistência dependem da condição dos joelhos.', 'Não forçar a articulação nem insistir diante de dor.'],
    ['ros', 'bracos', 'Rosca com halteres', 'Fortalece a parte da frente dos braços, útil para carregar objetos.', ['Braços', 'Peso leve'], 'Pode contribuir para a força dos braços ao carregar sacolas.', 'Dobrar os cotovelos levando as mãos aos ombros, sem balançar o tronco.', 'Peso, amplitude e posição dos punhos devem ser ajustados por profissional.', 'Interromper diante de dor. Halteres não são obrigatórios para todos.'],
    ['par', 'bracos', 'Flexão de braço na parede', 'Versão de baixo impacto para peito, ombros e braços.', ['Braços e peito', 'Em pé'], 'Pode contribuir para a força de empurrar, como abrir portas ou levantar-se de uma poltrona.', 'Em pé, de frente para a parede, dobrar e estender os cotovelos com o corpo alinhado.', 'Calçado antiderrapante e distância da parede definida pelo profissional.', 'Não realizar com dor no ombro sem avaliação.'],
    ['rem', 'costas', 'Remada sentada com faixa', 'Fortalece costas e ombros, ajudando na postura.', ['Costas', 'Faixa elástica'], 'Pode contribuir para a força de puxar e para estabilizar os ombros.', 'Com faixa adequada, puxar de forma controlada em direção ao tronco.', 'Verificar a faixa e sua fixação. A resistência deve ser definida por profissional.', 'Evitar prender a faixa em pontos instáveis. Não fazer com dor no ombro ou nas costas.'],
    ['cal', 'equilibrio', 'Elevação de calcanhares com apoio', 'Trabalha as panturrilhas e a estabilidade ao andar.', ['Equilíbrio', 'Com apoio'], 'Pode contribuir para a força das panturrilhas, importantes na marcha.', 'Segurando em apoio firme, subir e descer os calcanhares com controle.', 'Manter apoio estável. A versão sentada pode ser indicada pelo profissional.', 'Não praticar sem apoio se houver instabilidade.']
];
const passos = {
    cad: ['Sente-se na beira de uma cadeira firme, com os pés apoiados no chão.', 'Incline levemente o tronco à frente e levante-se devagar.', 'Sente-se de volta com controle, sem se jogar.'],
    joe: ['Sente-se com as costas apoiadas e os pés no chão.', 'Estenda um joelho devagar, até a perna ficar quase reta.', 'Volte com controle e repita com a outra perna.'],
    ros: ['Segure um peso leve em cada mão, com os braços ao lado do corpo.', 'Dobre os cotovelos levando as mãos aos ombros, mantendo os cotovelos junto ao corpo.', 'Desça devagar até a posição inicial.'],
    par: ['Fique de frente para a parede, a um passo de distância, com as mãos na altura dos ombros.', 'Dobre os cotovelos aproximando o peito da parede, com o corpo alinhado.', 'Empurre devagar de volta à posição inicial.'],
    rem: ['Sente-se com as costas retas e a faixa presa em um ponto firme à sua frente.', 'Puxe a faixa em direção ao tronco, aproximando as omoplatas.', 'Volte devagar, sem soltar a faixa de repente.'],
    cal: ['Em pé, segure firme em uma bancada ou encosto estável.', 'Suba devagar na ponta dos pés.', 'Desça os calcanhares com controle.']
};
const cats = {
    todos: 'Todos',
    pernas: 'Pernas',
    bracos: 'Braços',
    costas: 'Costas',
    equilibrio: 'Equilíbrio'
};
$('filtros').innerHTML = Object.entries(cats).map(([k, v]) => `<button type="button" aria-pressed="${k==='todos'}" data-c="${k}">${v}</button>`).join('');
$('filtros').onclick = e => {
    const b = e.target.closest('button');
    if (!b) return;
    document.querySelectorAll('#filtros button').forEach(x => x.setAttribute('aria-pressed', x === b));
    document.querySelectorAll('.ex').forEach(c => c.hidden = b.dataset.c !== 'todos' && c.dataset.c !== b.dataset.c);
    anunciar(b.textContent + ': ' + document.querySelectorAll('.ex:not([hidden])').length + ' exercícios exibidos')
};
$('lista').innerHTML = ex.map(e => `<article class="card ex" data-c="${e[1]}"><div class="art" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none">${svgs[e[0]]}</svg></div><div><h3>${e[2]}</h3><p>${e[3]}</p><div style="margin-top:.5rem">${e[4].map(t=>`<span class="tag">${t}</span>`).join('')}</div>
<details style="margin:0;border-width:1px"><summary>Benefícios e cuidados</summary><div class="det" style="padding:0 1rem 1rem"><div><strong>Possíveis benefícios</strong><p>${e[5]}</p></div><div><strong>Como é o movimento</strong><p>${e[6]}</p></div><div><strong>Cuidados</strong><p>${e[7]}</p></div><div><strong>Atenção</strong><p>${e[8]}</p></div><div style="grid-column:1/-1"><strong>Passo a passo</strong><ol class="passos">${passos[e[0]].map(x=>`<li>${x}</li>`).join('')}</ol><p style="margin-top:.5rem">Repetições e carga: definidas pelo seu profissional.</p></div></div></details></div></article>`).join('');

const mitos = [
    ['Musculação é perigosa para idosos.', 'Com avaliação, orientação e progressão gradual, o treino de força é recomendado por diretrizes. O sedentarismo também traz riscos importantes.'],
    ['Depois dos 60 não dá para ganhar força.', 'Estudos mostram ganhos de força em pessoas idosas que treinam com resistência, inclusive em idades bem avançadas.'],
    ['Preciso usar muito peso para ter resultado.', 'Faixas elásticas, o peso do próprio corpo e cargas leves podem funcionar. Quem define a carga é o profissional.'],
    ['Dor no treino é sinal de que está funcionando.', 'Cansaço muscular leve é esperado. Dor nas articulações, no peito ou dor aguda não é normal: pare e procure orientação.'],
    ['Descansar mais é melhor com o passar dos anos.', 'Descanso é importante, mas ficar muito parado acelera a perda de músculo. O ideal é equilibrar movimento e recuperação.']
];
$('mitos').innerHTML = mitos.map(m => `<details><summary><span class="mito">Mito:</span> ${m[0]}</summary><p><strong class="fato">Verdade:</strong> ${m[1]}</p></details>`).join('');

function tema(on) {
    const h = document.documentElement,
        a = typeof on === 'boolean' ? on : h.dataset.tema !== 'escuro';
    a ? h.dataset.tema = 'escuro' : delete h.dataset.tema;
    $('tm').setAttribute('aria-pressed', a);
    store.set('tm', a);
    if (typeof on !== 'boolean') anunciar(a ? 'Modo escuro ativado' : 'Modo escuro desativado')
}
tema(store.get('tm', window.matchMedia('(prefers-color-scheme: dark)').matches));
let ct;

function bip() {
    try {
        const a = new(window.AudioContext || window.webkitAudioContext)(),
            o = a.createOscillator(),
            g = a.createGain();
        o.connect(g);
        g.connect(a.destination);
        o.frequency.value = 880;
        g.gain.value = .2;
        o.start();
        o.stop(a.currentTime + .5)
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([300, 100, 300])
}

function cron(n) {
    clearInterval(ct);
    let r = n;
    const m = $('crono'),
        sh = () => m.textContent = Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0');
    sh();
    if (!n) {
        anunciar('Cronômetro parado.');
        return
    }
    anunciar('Descanso de ' + n + ' segundos iniciado.');
    ct = setInterval(() => {
        r--;
        sh();
        if (r === 10) anunciar('Faltam 10 segundos.');
        if (r <= 0) {
            clearInterval(ct);
            bip();
            anunciar('Descanso terminado. Pode continuar o exercício.')
        }
    }, 1000)
}
let log = store.get('log', []);
const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function reg(f) {
    log.unshift({
        t: Date.now(),
        f
    });
    store.set('log', log);
    draw();
    anunciar('Treino registrado: ' + f + '. ' + $('gres').textContent + ' ' + $('pt').textContent)
}

function del(i) {
    log.splice(i, 1);
    store.set('log', log);
    draw();
    anunciar('Registro apagado.')
}

function draw() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const c = Array(7).fill(0),
        lb = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(hoje);
        d.setDate(d.getDate() - 6 + i);
        lb.push(dias[d.getDay()])
    }
    log.forEach(l => {
        const d = new Date(l.t);
        d.setHours(0, 0, 0, 0);
        const i = Math.round((d - hoje) / 864e5) + 6;
        if (i >= 0 && i < 7) c[i]++
    });
    const tot = c.reduce((a, b) => a + b, 0),
        max = Math.max(1, ...c);
    $('graf').innerHTML = c.map((n, i) => `<div class="${i===6?'t':''}"><b style="font-size:.9rem">${n||''}</b><i style="height:${n?Math.max(14,n/max*80):3}%"></i></div>`).join('');
    $('rot').innerHTML = lb.map(x => `<span>${x}</span>`).join('');
    $('graf').setAttribute('aria-label', 'Treinos por dia: ' + lb.map((x, i) => x + ' ' + c[i]).join(', '));
    $('gres').textContent = tot ? `${tot} treino(s) nos últimos 7 dias.` : 'Nenhum treino registrado nos últimos 7 dias.';
    const hr = new Date().getHours();
    $('saud').textContent = (hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite') + '! ' + (tot ? `Você treinou ${tot} vez(es) nos últimos 7 dias.` : 'Que tal começar hoje, com calma?');
    $('sem').textContent = tot;
    const p = Math.min(tot, 2);
    $('pf').style.width = p / 2 * 100 + '%';
    $('pb').setAttribute('aria-valuenow', p);
    $('pt').textContent = tot >= 2 ? 'Meta semanal de referência atingida. Parabéns!' : tot === 1 ? 'Falta 1 treino para a meta de referência.' : 'Registre seu primeiro treino.';
    $('hist').innerHTML = log.length ? log.slice(0, 15).map((l, i) => `<div class="hrow"><span><strong>${l.f}</strong> · ${new Date(l.t).toLocaleDateString('pt-BR')} às ${new Date(l.t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span><button onclick="del(${i})" aria-label="Apagar registro de ${l.f} em ${new Date(l.t).toLocaleDateString('pt-BR')}">Apagar</button></div>`).join('') : '<p class="mut">Nenhum treino registrado ainda.</p>'
}
draw();
