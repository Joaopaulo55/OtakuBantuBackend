#!/bin/bash

# Script de solução para problemas com rss-parser
# Autor: [Seu Nome]
# Versão: 1.0

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir o cabeçalho
header() {
    clear
    echo -e "${BLUE}"
    echo "============================================"
    echo "  SOLUCIONADOR DE PROBLEMAS RSS-PARSER"
    echo "============================================"
    echo -e "${NC}"
}

# Função para verificar ambiente Node.js
check_node_env() {
    echo -e "${YELLOW}Verificando ambiente Node.js...${NC}"
    
    # Verifica se o Node.js está instalado
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js não está instalado${NC}"
        echo -e "Por favor, instale o Node.js v16 ou superior:"
        echo -e "🔗 ${BLUE}https://nodejs.org/${NC}"
        exit 1
    fi
    
    # Verifica versão do Node.js
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo -e "${RED}❌ Versão do Node.js muito antiga (v$NODE_VERSION)${NC}"
        echo -e "Atualize para Node.js v16 ou superior"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Node.js v$(node -v) instalado${NC}"
    
    # Verifica se npm está instalado
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm não está instalado${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ npm v$(npm -v) instalado${NC}"
}

# Função para instalar/reinstalar rss-parser
reinstall_rss_parser() {
    echo -e "${YELLOW}\nOpção selecionada: Instalar/Reinstalar rss-parser${NC}"
    
    # Remove o pacote se existir
    echo -e "${BLUE}Removendo rss-parser...${NC}"
    npm uninstall rss-parser
    
    # Instala a versão mais recente
    echo -e "${BLUE}Instalando rss-parser...${NC}"
    npm install rss-parser@latest
    
    # Verifica se a instalação foi bem-sucedida
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ rss-parser instalado com sucesso${NC}"
    else
        echo -e "${RED}❌ Falha ao instalar rss-parser${NC}"
    fi
}

# Função para alternativas ao rss-parser
show_alternatives() {
    echo -e "${YELLOW}\nAlternativas ao rss-parser:${NC}"
    
    echo -e "\n${BLUE}1. feedparser (Python)${NC}"
    echo -e "   Documentação: https://pythonhosted.org/feedparser/"
    echo -e "   Instalação: pip install feedparser"
    
    echo -e "\n${BLUE}2. node-feed (Node.js)${NC}"
    echo -e "   GitHub: https://github.com/jpmonette/feed"
    echo -e "   Instalação: npm install feed"
    
    echo -e "\n${BLUE}3. fast-xml-parser (Node.js)${NC}"
    echo -e "   GitHub: https://github.com/NaturalIntelligence/fast-xml-parser"
    echo -e "   Instalação: npm install fast-xml-parser"
    
    echo -e "\n${BLUE}4. Usar API de terceiros${NC}"
    echo -e "   Exemplo: https://rss2json.com/"
    echo -e "   Exemplo: https://fetchrss.com/"
}

# Função para links úteis
show_useful_links() {
    echo -e "${YELLOW}\nLinks úteis:${NC}"
    
    echo -e "\n${BLUE}1. Documentação oficial rss-parser${NC}"
    echo -e "   https://www.npmjs.com/package/rss-parser"
    
    echo -e "\n${BLUE}2. Issues no GitHub do rss-parser${NC}"
    echo -e "   https://github.com/rbren/rss-parser/issues"
    
    echo -e "\n${BLUE}3. Stack Overflow - Perguntas sobre rss-parser${NC}"
    echo -e "   https://stackoverflow.com/questions/tagged/rss-parser"
}

# Função para solução alternativa com Python
python_fallback_solution() {
    echo -e "${YELLOW}\nConfigurando solução alternativa com Python:${NC}"
    
    # Verifica se o Python está instalado
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 não está instalado${NC}"
        echo -e "Deseja instalar o Python 3? (s/n)"
        read -r answer
        if [ "$answer" = "s" ]; then
            sudo apt-get update
            sudo apt-get install -y python3 python3-pip
        else
            return
        fi
    fi
    
    # Instala dependências Python
    echo -e "${BLUE}Instalando feedparser...${NC}"
    pip3 install feedparser beautifulsoup4 requests
    
    echo -e "${GREEN}✓ Solução alternativa com Python configurada${NC}"
    echo -e "\nVocê pode usar o seguinte código Python para parsing RSS:"
    echo -e "${BLUE}"
    cat << 'EOL'
import feedparser
import json

feed = feedparser.parse("URL_DO_FEED_RSS_AQUI")

# Converter para JSON
result = {
    "items": [{
        "title": entry.title,
        "link": entry.link,
        "contentSnippet": entry.get("summary", "")
    } for entry in feed.entries[:10]]
}

print(json.dumps(result))
EOL
    echo -e "${NC}"
}

# Menu principal
main_menu() {
    header
    check_node_env
    
    echo -e "\n${YELLOW}Selecione uma opção:${NC}"
    echo -e "1) ${BLUE}Instalar/Reinstalar rss-parser${NC}"
    echo -e "2) ${BLUE}Mostrar alternativas ao rss-parser${NC}"
    echo -e "3) ${BLUE}Mostrar links úteis${NC}"
    echo -e "4) ${BLUE}Configurar solução alternativa com Python${NC}"
    echo -e "5) ${BLUE}Sair${NC}"
    
    read -p "Opção: " choice
    
    case $choice in
        1) reinstall_rss_parser ;;
        2) show_alternatives ;;
        3) show_useful_links ;;
        4) python_fallback_solution ;;
        5) exit 0 ;;
        *) echo -e "${RED}Opção inválida${NC}"; sleep 1; main_menu ;;
    esac
    
    echo -e "\nPressione qualquer tecla para continuar..."
    read -n 1 -s
    main_menu
}

# Inicia o menu principal
main_menu
