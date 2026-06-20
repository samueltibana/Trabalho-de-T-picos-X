# FlashLingo — Guia de Funcionalidades

Este documento descreve tudo que o app faz, do ponto de vista de quem usa — não de como foi construído. Para detalhes técnicos e de segurança, veja `README_TECNICO.md` (versão com servidor) ou os documentos da versão monolítica. Para executar o app baixe qualquer versão e abre ele em seu navegador

---

## 1. Decks (baralhos de cards)

### 1.1 Decks inclusos

O app vem com 12 decks prontos para baixar na aba **Baixar**:

| Deck | Idioma | Cards |
|---|---|---|
| Phrasal Verbs EN | Inglês | 12 |
| Japonês N5 Básico | Japonês | 12 |
| Japonês N4 Kanji | Japonês | 10 |
| Espanhol Básico | Espanhol | 12 |
| Francês Básico | Francês | 10 |
| Alemão Básico | Alemão | 10 |
| Mandarim Básico | Mandarim | 10 |
| Italiano Básico | Italiano | 10 |
| Coreano Básico | Coreano | 10 |
| Russo Básico | Russo | 10 |
| Árabe Básico | Árabe | 10 |
| Vocabulário PT-EN | Português → Inglês | 10 |

Cada card tem frente, verso, e opcionalmente leitura/fonética e uma frase de exemplo.

### 1.2 Importar decks externos

Na aba **Baixar → Importar**, duas formas de adicionar decks de fora:

- **Colar JSON**: cole o conteúdo direto numa caixa de texto. Funciona sempre, mesmo offline ou se algum serviço externo estiver fora do ar.
- **Via URL**: informe o link de um arquivo `.json` público (ex: um Gist do GitHub). O app tenta três serviços de proxy diferentes em sequência até conseguir buscar o arquivo.

Todo deck importado passa por validação antes de ser aceito: estrutura do JSON, tamanho (máximo 1 MB), e sanitização de cada campo de texto (remove HTML/scripts). Você vê uma pré-visualização dos primeiros cards antes de confirmar a importação.

**Formato esperado:**
```json
{
  "name": "Nome do Deck",
  "icon": "📚",
  "cards": [
    { "f": "frente", "b": "verso", "r": "leitura (opcional)", "ex": "exemplo (opcional)" }
  ]
}
```

### 1.3 Criar e editar decks manualmente

Na aba **Editor**:
- **+ Novo Deck**: cria um deck vazio, escolhendo nome, ícone e idioma (usado depois para a pronúncia de voz).
- Clique em qualquer card da lista para editar frente, verso, leitura, exemplo, ou marcá-lo como favorito/difícil.
- **+ Card**: adiciona um novo card ao deck selecionado.
- **🗑 Excluir deck**: remove decks criados por você (decks inclusos não podem ser excluídos, só desinstalados).
- **↓ Exportar**: baixa o deck selecionado como arquivo `.json`, útil para fazer backup ou compartilhar com outra pessoa.

### 1.4 Deck de favoritos/difíceis

Botão **⭐ Criar deck de favoritos**: gera um novo deck juntando só os cards que você marcou como favorito e/ou difícil, de um deck específico ou de todos ao mesmo tempo. Útil para revisar de forma concentrada só o que está dando mais trabalho.

---

## 2. Estudo com repetição espaçada (SM-2)

### 2.1 Como funciona

Cada card guarda seu próprio histórico de repetições. Toda vez que você responde um card, o algoritmo SM-2 decide quando ele deve aparecer de novo:

| Sua resposta | O que acontece |
|---|---|
| **✗ Errei** | O card volta a aparecer já no dia seguinte |
| **~ Difícil** | O intervalo até a próxima revisão cresce pouco |
| **✓ Bom** | O intervalo cresce de forma normal |
| **★ Fácil** | O intervalo cresce mais — o card "amadurece" mais rápido |

Cards passam por quatro estágios visíveis durante o estudo (mostrados como uma etiqueta colorida acima do card):

- 🟢 **Novo** — nunca foi estudado
- 🟣 **Aprendendo** — nas primeiras repetições
- 🔵 **Revisão** — já tem algum intervalo, mas ainda não é considerado maduro
- 🟡 **Maduro** — intervalo de 21 dias ou mais; você já domina bem

### 2.2 Iniciar uma sessão

Clicar em qualquer deck na tela inicial abre uma janela para configurar a sessão antes de começar:

- **Cards a revisar**: controle deslizante de 5 a 100 cards
- **Filtro de cards**:
  - *Todos os devidos (SM-2)* — comportamento padrão, só mostra cards que estão na hora de revisar
  - *Apenas favoritos*
  - *Apenas difíceis*
  - *Apenas novos*
  - *Cram* — ignora todo o agendamento do SM-2 e mostra todos os cards do deck, útil para revisar tudo de uma vez antes de uma prova

### 2.3 Durante o estudo

- Clique no card (ou aperte **Espaço**) para virá-lo e ver a resposta
- Avalie com os 4 botões de baixo, ou pelos atalhos numéricos
- **⭐** marca/desmarca o card atual como favorito
- **🔴** marca/desmarca o card atual como difícil
- **🔊** reproduz a pronúncia do card (veja seção de Áudio)
- A barra de progresso no topo mostra quantos cards faltam na sessão

Ao final da sessão, um resumo mostra acertos, erros, e uma mensagem que varia conforme sua taxa de acerto (de "Excelente!" a "Mais prática").

---

## 3. Áudio e pronúncia

### 3.1 Pronúncia por voz (TTS)

O botão 🔊 (ou atalho **T**) lê em voz alta o conteúdo atual do card, usando a síntese de voz nativa do navegador:

- Card não virado → lê a **frente** (palavra/frase no idioma estudado), na voz do idioma configurado para aquele deck
- Card virado → lê o **verso** (tradução), em português

A qualidade e disponibilidade da voz depende do que está instalado no seu sistema operacional — alguns idiomas (japonês, coreano, árabe) podem não ter voz nativa em todo computador. Se isso acontecer, o app avisa.

Em **Configurações → Áudio**, você pode:
- Escolher manualmente qual voz usar (se houver várias instaladas)
- Ativar **TTS automático**, que pronuncia o card sozinho ao virá-lo, sem precisar clicar no botão

### 3.2 Sons de feedback

Três efeitos sonoros curtos, gerados ao vivo pelo navegador (sem arquivos de áudio externos):

- **Flip**: um som tipo "whoosh" ao virar o card
- **Acerto**: um som ascendente ao marcar Bom/Fácil
- **Erro**: um som descendente ao marcar Errei/Difícil

Cada um tem volume ajustável de forma independente em **Configurações → Áudio**, incluindo a opção de silenciar completamente (volume 0%).

---

## 4. Estatísticas e progresso

A aba **Estatísticas** reúne:

### 4.1 Cartões-resumo
Total de revisões, precisão geral, streak atual, melhor streak já alcançado, cards aprendidos (vs. total disponível), e quantidade de favoritos.

### 4.2 Gráfico de atividade
Quantidade de cards revisados por dia, com três janelas de tempo selecionáveis: **7 dias**, **30 dias** ou **90 dias**. Passe o mouse sobre uma barra para ver o valor exato e a data.

### 4.3 Gráfico de evolução de precisão
Uma linha mostrando como sua taxa de acerto mudou ao longo do tempo (até 90 sessões de histórico), permitindo ver se você está melhorando, estagnado, ou regredindo num idioma.

### 4.4 Distribuição de respostas
Um gráfico de rosca mostrando a proporção entre respostas Fácil/Bom, Difícil e Errei, no total de todas as suas sessões.

### 4.5 Estatísticas por deck
Lista com, para cada deck instalado: número de revisões, acertos, erros, cards pendentes, e uma barra de progresso de quanto do deck já foi estudado pelo menos uma vez.

### 4.6 Streak (sequência de dias)
Um contador de "dias seguidos estudando" aparece fixo na barra lateral (🔥). Estudar pelo menos uma vez por dia mantém a sequência; pular um dia a zera. O recorde pessoal (melhor streak) é salvo separadamente e nunca diminui.

---

## 5. Personalização

### 5.1 Temas de cores

Em **Configurações → Tema de cores**, seis paletas predefinidas:

| Tema | Estilo |
|---|---|
| Noite (padrão) | Azul/roxo escuro |
| Floresta | Tons de verde |
| Pôr do sol | Laranja quente |
| Oceano | Azul ciano |
| Sakura | Rosa/lilás |
| Mono | Preto e branco, sem cor |

A troca é instantânea e aplicada em todo o app.

### 5.2 Configurações de sessão

- **Cards por sessão**: define o padrão de quantos cards aparecem (5 a 100), usado como sugestão ao abrir a janela de início de sessão
- **Ordem dos cards**: SM-2 (recomendado), Aleatório, ou Sequencial
- **Mostrar leitura/furigana**: liga/desliga a exibição da transliteração nos cards que têm esse campo

### 5.3 Atalhos de teclado personalizáveis

Em **Configurações → Atalhos de teclado**, cada ação tem uma tecla configurável:

| Ação | Atalho padrão |
|---|---|
| Virar card | Espaço |
| Errei | 1 |
| Difícil | 2 |
| Bom | 3 |
| Fácil | 4 |
| Pronunciar | T |
| Favoritar | F |
| Marcar difícil | H |
| Sair da sessão | Esc |

Para trocar um atalho: clique no campo correspondente e pressione a nova tecla desejada. Botão **Restaurar padrões** reverte tudo de uma vez.

---

## 6. Persistência e funcionamento offline

- Todo o progresso (decks, repetições, favoritos, configurações, estatísticas, streak) é salvo automaticamente a cada interação — não existe botão "salvar".
- Na versão com servidor, os dados também sincronizam para o backend, com indicador visual (✓ Sincronizado / ⚡ Offline / ↑ Salvando...) sempre visível.
- O app funciona normalmente sem conexão à internet depois do primeiro carregamento (graças ao Service Worker), exceto para baixar decks externos via URL.

---

## 7. Resumo visual da navegação

```
┌─────────────┐
│  🏠 Início      │ → Lista de decks instalados + cards pendentes do dia
│  📊 Estatísticas│ → Gráficos e números de progresso
│  ✏️  Editor      │ → Criar/editar decks e cards manualmente
│  📦 Baixar      │ → Decks inclusos + importação externa
│  ⚙️  Config.    │ → Temas, sessão, áudio, atalhos
└─────────────┘
```
