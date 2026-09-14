<template>
  <div>
    <h1>Books with ISBN &gt; 1000</h1>
    <ul>
      <li v-for="book in books" :key="book.id">
        {{ book.name }} (ISBN: {{ book.isbn }})
        <button type="button" @click="updateBook(book)">Update</button>
        <button type="button" @click="deleteBook(book.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../Firebase/init.js';
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const books = ref([]);

const fetchBooks = async () => {
  try {
    const q = query(
      collection(db, 'books'),
      where('isbn', '>', 1000),
      orderBy('isbn', 'asc'),
      limit(3)
    );

    const querySnapshot = await getDocs(q);
    const booksArray = [];

    querySnapshot.forEach((doc) => {
      booksArray.push({
        id: doc.id,
        ...doc.data()
      });
    });

    books.value = booksArray;
  } catch (error) {
    console.error('Error fetching books: ', error);
    alert('Unable to load books. Please try again.');
  }
};

const updateBook = async (book) => {
  const newName = window.prompt('Enter the new book name:', book.name);

  if (newName === null) return;

  if (!newName.trim()) {
    alert('Please enter a valid book name.');
    return;
  }

  try {
    await updateDoc(doc(db, 'books', book.id), {
      name: newName.trim()
    });
  } catch (error) {
    console.error('Error updating book: ', error);
    alert('Unable to update the book. Please try again.');
    return;
  }

  await fetchBooks();
};

const deleteBook = async (bookId) => {
  try {
    await deleteDoc(doc(db, 'books', bookId));
  } catch (error) {
    console.error('Error deleting book: ', error);
    alert('Unable to delete the book. Please try again.');
    return;
  }

  await fetchBooks();
};

onMounted(() => {
  fetchBooks();
});
</script>
