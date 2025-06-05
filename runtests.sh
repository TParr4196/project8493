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

#got help adapting the awk line from chat to how the starter code formats its responses
status POST /businesses
curl -s -X POST \
    ${BASEURL}/businesses -H 'Content-Type: application/json' \
      -d '{"name": "Brunos", "address": "6th st.", "city": "Bemd", "state": "OR", "zip": "97333", "category": "Fud", "subcategory": "Gud"}' | tee "$tempfile"
    businessid=$(awk -F'"' '/id/ {print $4}' "$tempfile")

status GET /businessess/:id
curl ${BASEURL}/businesses/$businessid

# got help from chatgpt formatting this test: helped me swap to -F and remove content header
status POST /photos
curl -s -X POST \
    ${BASEURL}/photos \
      -F 'photodata=@./testassets/pizza.png' \
      -F 'businessId='$businessid \
      -F 'caption=Pizza' | tee "$tempfile"
    photoid=$(awk -F: '{print $2}' "$tempfile" | awk -F, '{print $1}' | tr -d '"')

status GET /photos/:id
curl ${BASEURL}/photos/$photoid

status GET /businessess/:id
curl ${BASEURL}/businesses/$businessid

status GET /media/photos/:id
curl "$BASEURL/media/photos/$photoid" -o "./testassets/testoutputs/$photoid.png"

status GET /media/thumbs/:id
curl "$BASEURL/media/thumbs/$photoid" -o "./testassets/testoutputs/thumb$photoid.jpeg"