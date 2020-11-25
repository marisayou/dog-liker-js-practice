document.addEventListener("DOMContentLoaded", () => {
    const DOGSURL = "http://localhost:3000/dogs"
    const main = document.querySelector("main")
    const newDogForm = document.getElementById("new-dog-form")
    newDogForm.addEventListener("submit", addNewDog)
    getDogs()

    function addNewDog(e) {
        e.preventDefault()
        const name = e.target.name.value
        const breed = e.target.breed.value
        const image = e.target.image.value
        const configObj = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                "likes": 0,
                "name": name,
                "breed": breed,
                "image": image,
                "comments": []
            })
        }
        fetch(DOGSURL, configObj)
        .then(res => res.json())
        .then(dog => showDog(dog))

        newDogForm.reset()
    }

    function getDogs() {
        main.innerHTML = ""
        fetch(DOGSURL)
        .then(res => res.json())
        .then(dogs => dogs.forEach(dog => showDog(dog)))
    }    

    function showDog(dog) {
        let dogDiv
        if (document.getElementById(`${dog.id}`)) {
            dogDiv = document.getElementById(`${dog.id}`)
        } else {
            dogDiv = document.createElement("div")
            dogDiv.id = dog.id
            main.appendChild(dogDiv)
        }
        
        dogDiv.innerHTML = `<h2>${dog.name}</h2>
        <p>${dog.breed}</p>
        <img src='${dog.image}'></img>
        <br>
        <p class="likes">Likes: ${dog.likes}</p>
        <button class="like-btn">Like</button>
        <button class="super-like-btn">Super Like</button>
        <p>Comments:</p>
        <ul></ul>
        <form>
            <label>Add Comment:</label>
            <input placeholder='text here' type='text' name='comment'></input>
            <input type='submit'></input>
        </form>`

        const ul = dogDiv.querySelector("ul")
        for (const comment of dog.comments) {
            const li = document.createElement("li")
            li.innerText = comment
            ul.appendChild(li)
        }

        const form = dogDiv.querySelector("form")
        form.addEventListener("submit", (e) => submitCommentForm(e, dog))

        dogDiv.addEventListener("click", (e) => handleBtnClick(e, dog))
    }
    
    function submitCommentForm(e, dog) {
        e.preventDefault()
        const dogId = e.target.parentElement.id
        const comment = e.target.comment.value
        dog.comments.push(comment)

        const body = {
            "comments": dog.comments
        }

        const configObj = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body)
        }
        fetch(DOGSURL + "/" + dogId, configObj)
        .then(res => res.json())
        .then(dog => {
            const ul = document.getElementById(dogId).querySelector("ul")
            const li = document.createElement("li")
            li.innerText = dog.comments[dog.comments.length - 1]
            ul.appendChild(li)
        })

        e.target.reset()
    }

    function handleBtnClick(e, dog) {
        if (e.target.tagName == "BUTTON") {
            likeDog(e, dog, e.target.className)
        }
    }

    function likeDog(e, dog, btnType) {
        const dogDiv = e.target.parentElement
        const dogId = dogDiv.id

        let likes = dog.likes
        if (btnType == "like-btn") {
            likes += 1
        }
        else if (btnType == "super-like-btn") {
            likes += 10
        }
        // optimistic
        // const displayLikes = dogDiv.querySelector(".likes")
        // displayLikes.innerText = `Likes: ${likes}`

        const configObj = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                likes: likes
            })
        }
        fetch(DOGSURL + "/" + dogId, configObj)
        .then(res => res.json())
        .then(dog => {
            showDog(dog) // pessimistic
        })
    }
})