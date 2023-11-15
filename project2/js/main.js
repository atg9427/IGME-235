window.onload = (e) => {
    document.querySelector("#search").onchange = getResult
    document.querySelector("#get-more").onclick = getMore
};

let displayTerm = "";
const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";
let GIPHY_KEY = "5PuWjWVnwpHUQPZK866vd7wQ2qeCeqg7";
let limit = 10;

function getResult(){
    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    let searchedTerm = document.querySelector("#search").value;
    displayTerm = searchedTerm;

    searchedTerm = searchedTerm.trim();
    searchedTerm = encodeURIComponent(searchedTerm);

    if(searchedTerm.length<1) return;

    url += "&q=" + searchedTerm + "&limit=" + limit;

    document.querySelector("#status").innerHTML = `<b>Searching for ${displayTerm}</b>`;

    console.log(url);
    getData(url);
}

function getMore(){
    console.log("searchButtonClicked() called");

    limit += 10;
    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    // let searchedTerm = document.querySelector("#search").value;
    // displayTerm = searchedTerm;

    displayTerm = displayTerm.trim();
    displayTerm = encodeURIComponent(displayTerm);

    if(displayTerm.length<1) return;

    url += "&q=" + displayTerm + "&limit=" + limit; // searchedTerm

    document.querySelector("#status").innerHTML = `<b>Searching for ${displayTerm}</b>`;

    console.log(url);
    getData(url);
}

function getData(url){
    let xhr = new XMLHttpRequest();
    xhr.onload = loadedData;
    xhr.onerror = errorMessage;
    xhr.open("GET", url);
    xhr.send();
}

function loadedData(e){
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);

    if(!obj.data || obj.data.length == 0){
        document.querySelector("#status").innerHTML = `No results found for <i>\"${displayTerm}\"</i>`;
        return;
    }

    let searchResults = obj.data;
    let longString = "";

    for(let i=0; i<searchResults.length; ++i){
        let result = searchResults[i];

        let smallURL = result.images.fixed_width.url;
        if (!smallURL) smallURL = "images/no-image-found.png";

        let url = result.url;
        let rating = result.rating.toUpperCase();

        let line = `<div class='result'>
        <img src='${smallURL}' title= '${result.id}' />
        <span><a target='_blank' href='${url}'>View on GIPHY</a></span>
        <span>Rating: ${rating}</span></div>`;
        longString += line;
    }
    document.querySelector("#content").innerHTML = longString;
    document.querySelector("#status").innerHTML = `Success! &nbsp <i>Here are ${searchResults.length} results for \"${displayTerm}\"</i>`;
}

function errorMessage(e){
    console.log("There was an error");
}