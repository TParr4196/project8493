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

status POST /photos
curl -s -X POST \
    ${BASEURL}/photos -H 'Content-Type: application/json' \
      -d '{"businessid": 18, "caption": "Pizza"}' | tee "$tempfile"
    photoid=$(awk -F: '{print $2}' "$tempfile" | awk -F, '{print $1}' | tr -d '"')