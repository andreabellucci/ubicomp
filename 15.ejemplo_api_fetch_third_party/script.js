async function getRandomJoke() {
    const response = await fetch('https://api.chucknorris.io/jokes/random');
    const joke = await response.json();
    document.querySelector('#joke').textContent = joke.value;
}

document.querySelector('#get_joke').addEventListener('click', getRandomJoke);