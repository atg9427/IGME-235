window.onload = (e) => {
    document.getElementById("search").onchange = getResult
    document.getElementById("get-more").onclick = getMore

    document.querySelector("#relevance").onclick = function(event){
        if(document.getElementById("search").onchange != null){
            document.getElementById("search").onchange = null
        }
        event.preventDefault();
        document.getElementById("search").onchange = getResult
    }

    document.querySelector("#trending").onclick = function(event){
        if(document.getElementById("search").onchange != null){
            document.getElementById("search").onchange = null
        }
        event.preventDefault()
        document.getElementById("search").onchange = getTrending
    }
};

let displayTerm = "";
let navWord = "";
let GIPHY_URL = "";
let GIPHY_KEY = "2o98VKLNj1kxmN1x0Sse32mmrOO2N4O1"; // Personal GIPHY API Key
let limit = 10;
let imageList = [];
let favoritesList = [];
let clickedList = [];

function getResult(){
    navWord = "search";
    GIPHY_URL = `https://api.giphy.com/v1/gifs/${navWord}?`;

    imageList.length = 0;

    // Reset limit to 10 for every new search
    limit = 10;

    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    let searchedTerm = document.querySelector("#search").value;
    displayTerm = searchedTerm;

    searchedTerm = encodeURIComponent(searchedTerm);

    if(searchedTerm.length<1) return;

    url += "&q=" + searchedTerm + "&limit=" + limit;

    document.querySelector("#status").innerHTML = `<b>Searching for \"${displayTerm}\" </b>`;
    document.querySelector("#content").innerHTML = `<div id='buffer'><img src='images/buffer-spinner.gif' height='100px' width='100px'/></div>`;

    console.log(url);
    getData(url);
}

function getMore(){
    imageList.length = 0;

    limit += 10;
    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    let searchedTerm = displayTerm;
    searchedTerm = encodeURIComponent(searchedTerm);

    if(searchedTerm.length<1) return;

    url += "&q=" + searchedTerm + "&limit=" + limit;

    document.querySelector("#status").innerHTML = `<b>Searching for \"${displayTerm}\"</b>`;
    document.querySelector("#content").innerHTML = `<div id='buffer'><img src='images/buffer-spinner.gif' height='100px' width='100px'/></div>`;

    console.log(url);
    getData(url);
}

// function getFavorites(){

// }

function getTrending(){
    navWord = "trending";
    GIPHY_URL = `https://api.giphy.com/v1/gifs/${navWord}?`;
    imageList.length = 0;

    // Reset limit to 10 for every new search
    limit = 10;

    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    let searchedTerm = navWord;
    displayTerm = searchedTerm;
    searchedTerm = encodeURIComponent(searchedTerm);

    url += "&q=" + searchedTerm + "&limit=" + limit;

    document.querySelector("#status").innerHTML = `<b>Searching for ${displayTerm} GIFs</b>`;
    document.querySelector("#content").innerHTML = `<div id='buffer'><img src='images/buffer-spinner.gif' height='100px' width='100px'/></div>`;

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

    if((!obj.data || obj.data.length == 0)){
        document.querySelector("#status").innerHTML = `No results found for <i>\"${displayTerm}\"</i>`;
        document.querySelector("#content").innerHTML = `<div id='no-image-found'><img src='images/no-image-found.jpg' height='100px' width='100px'/></div>`;
        return;
    }

    let searchResults = obj.data;
    let longString = "";

    for(let i=0; i<searchResults.length; ++i){
        let result = searchResults[i];

        let smallURL = result.images.fixed_width.url;
        if (!smallURL) smallURL = "images/no-image-found.jpg";

        let url = result.url;
        let rating = result.rating.toUpperCase();

        let line = `<div class='result'>
        <img src='${smallURL}' title= '${result.id}' />
        <span><a target='_blank' href='${url}' >View on GIPHY</a></span>
        <span>Rating: ${rating}</span>
        <span>Favorite:&nbsp<button type='button' onclick='addToFavorites()' onclick='checkIfClicked(${i})' id='favorite' id='${i}' class='color'></button></span></div>`;
        longString += line;
        imageList.push(line);
        clickedList.push(false);
    }
    switch(navWord){
        case "search":
            document.getElementById("relevance").href = longString;
            console.log(longString);
            break;
        case "trending":
            document.getElementById("trending").href = longString;
            console.log(longString);
            break;
    }
    document.querySelector("#content").innerHTML = longString;
    document.querySelector("#status").innerHTML = `Success! &nbsp <i>Here are ${searchResults.length} results for \"${displayTerm}\"</i>`;

    // Only show Get More button after a search is made and stop at 50 search results
    if(limit < 50 && (imageList.length == limit)){
        document.querySelector('button#get-more').style.cssText = "display: inline-block; border-style: solid; border-radius: 50px; padding: 10px 100px; cursor: pointer;";
    } else{
        document.querySelector('button#get-more').style.cssText = "display: none;";
    }
}

function checkIfClicked(index){
    clickedList[index] = !clickedList[index];
}

function errorMessage(e){
    console.log("There was an error");
}

function addToFavorites(){
    for(let i=0; i<imageList.length; ++i){
        if(clickedList[i] = true == true){
            if(!favoritesList.includes(imageList[i])){
                favoritesList.push(imageList[i]);
                console.log("Added " + imageList[i] + " to favorites");
                break;
            }
        }
    }
}

function getStyle(el, styleProp){
    if(el.currentStyle) return e.currentStyle[styleProp];
}