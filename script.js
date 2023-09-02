const books = []
const RENDER_EVENT = "render-book"
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_SHELF";

document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("inputBook")
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault()
        addBook()
    })

    const searchBookForm = document.getElementById("searchBook")
    searchBookForm.addEventListener("submit", function (event) {
        event.preventDefault()
        searchBook()
    })

    if (isStorageExist()) {
        loadDataFromStorage()
    }
})

document.addEventListener(RENDER_EVENT, function () {
    const unCompletedBook = document.getElementById("incompleteBookshelfList")
    unCompletedBook.innerHTML = ""

    const completedBookList = document.getElementById("completeBookshelfList")
    completedBookList.innerHTML = ""

    for (let bookItem of books) {
        const bookElement = makeBookArticleElement(bookItem)

        if (bookItem.isComplete === false) {
            unCompletedBook.append(bookElement)
        } else {
            completedBookList.append(bookElement)
        }
    }
})

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY))
})

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert("Your browser not support local storage")
        return false
    }
    return true
}

function addBook() {
    const bookTitle = document.getElementById("inputBookTitle").value
    const bookAuthor = document.getElementById("inputBookAuthor").value
    const year = document.getElementById("inputBookYear").value
    const isCompleteCheck = document.getElementById("inputBookIsComplete")
    const isComplete = isCompleteCheck.checked === true;

    const generatedID = generateID()
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, year, isComplete)
    books.push(bookObject)

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function searchBook() {
    const bookTitle = document.getElementById("searchBookTitle").value.toLowerCase()
    const serializedData = localStorage.getItem(STORAGE_KEY)

    const data = JSON.parse(serializedData)
    const bookFilter = data.filter(function (book) {
        return book.bookTitle.toLowerCase().includes(bookTitle)
    })

    books.length = 0
    if (bookFilter !== null) {
        for (let book of bookFilter) {
            books.push(book)
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT))
}

function generateBookObject(id, bookTitle, bookAuthor, year, isComplete) {
    return {id, bookTitle, bookAuthor, year, isComplete}
}

function generateID() {
    return +new Date()
}

function makeBookArticleElement(bookObject) {
    const textTitle = document.createElement("h3")
    textTitle.innerText = bookObject.bookTitle

    const textAuthor = document.createElement("p")
    textAuthor.innerText = "Author : " + bookObject.bookAuthor

    const textYear = document.createElement("p")
    textYear.innerText = "Year : " + bookObject.year

    const finishToggleButton = document.createElement("button")
    finishToggleButton.classList.add("green")

    const deleteButton = document.createElement("button")
    deleteButton.classList.add("red")
    deleteButton.innerText = "Delete book"
    deleteButton.addEventListener("click", function () {
        if (confirm("Are you sure want to delete this book?")) {
            removeBook(bookObject.id)
        }
    })

    const actionDiv = document.createElement("div")
    actionDiv.classList.add("action")

    if (bookObject.isComplete) {

        finishToggleButton.innerText = "Re-Read"
        finishToggleButton.addEventListener("click", function () {
            undoBookFromComplete(bookObject.id)
        })

        actionDiv.append(finishToggleButton, deleteButton)
    } else {
        finishToggleButton.innerText = "Finish Reading"
        finishToggleButton.addEventListener("click", function () {
            addBookToComplete(bookObject.id)
        })

        actionDiv.append(finishToggleButton, deleteButton)
    }

    const container = document.createElement("article")
    container.classList.add("book_item")
    container.append(textTitle, textAuthor, textYear, actionDiv)
    container.setAttribute("id", `book-${bookObject.id}`)

    return container
}

function addBookToComplete(bookId) {
    const bookTarget = findBook(bookId)
    if (bookTarget == null) return

    bookTarget.isComplete = true
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function findBook(bookId) {
    for (let bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem
        }
    }

    return null
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId)
    if (bookTarget === -1) return
    books.splice(bookTarget, 1)

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function undoBookFromComplete(bookId) {
    const bookTarget = findBook(bookId)
    if (bookTarget == null) return

    bookTarget.isComplete = false
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function findBookIndex(bookId) {
    for (let index in books) {
        if (books[index].id === bookId) {
            return index
        }
    }

    return -1
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY)

    let data = JSON.parse(serializedData)
    console.log(data)
    if (data !== null) {
        for (let book of data) {
            books.push(book)
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT))
}