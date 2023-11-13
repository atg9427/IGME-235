let displayTerm = "";

function getResult() {
    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";
    let GIPHY_KEY = "5PuWjWVnwpHUQPZK866vd7wQ2qeCeqg7";

    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    let searchedTerm = document.querySelector("#search").value;
    displayTerm = searchedTerm;

    searchedTerm = searchedTerm.trim();
    searchedTerm = encodeURIComponent(searchedTerm);

    if(searchedTerm.length<1) return;

    let limit = 25;
    url += "&q=" + searchedTerm + "&limit=" + limit;
}