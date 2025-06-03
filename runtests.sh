# adapted from assignment 2
HOST=localhost
PORT=8000

BASEURL="http://${HOST}:${PORT}"

GREEN=$(tput setaf 10)
RESET=$(tput sgr0)

status() {
    printf "\n%s+=====================================================\n" "$GREEN"
    printf "| %s\n" "$*"
    printf "+=====================================================\n%s" "$RESET"
}

tempfile=curl.out.$$.tmp

# got help from chatgpt formatting this test: helped me swap to -F and remove content header
status POST /photos
curl -s -v -X POST \
    ${BASEURL}/photos \
      -F 'photodata=@./testassets/pizza.png' \
      -F 'businessId=683e011f4a383c9f7e023018' \
      -F 'caption=Pizza' | tee "$tempfile"
    photoid=$(awk -F: '{print $2}' "$tempfile" | awk -F, '{print $1}' | tr -d '"')

status GET /photos/:id
curl ${BASEURL}/photos/$photoid