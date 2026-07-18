import { createContext, useState, useEffect } from "react";
import { ID, Permission, Role, Query } from "react-native-appwrite";
import { tablesDB, client } from "../lib/appwrite";
import { useUser } from "../hooks/useUser";

const DATABASE_ID = "6a59e889003980dcaa14";
const TABLE_ID = "books";

export const BooksContext = createContext();

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);

  const { user } = useUser();

  async function fetchBooks() {
    try {
      const response = await tablesDB.listRows(DATABASE_ID, TABLE_ID, [
        Query.equal("userId", user.$id),
      ]);

      setBooks(response.rows);

      // console.log("this is the query result", response.rows);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function fetchBookById(id) {
    try {
      const response = await tablesDB.getRow(DATABASE_ID, TABLE_ID, id);

      return response;
    } catch (error) {
      console.log(error.message);
    }
  }

  async function createBook(data) {
    try {
      await tablesDB.createRow(
        DATABASE_ID,
        TABLE_ID,
        ID.unique(),
        {
          ...data,
          userId: user.$id,
        },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ],
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  async function deleteBook(id) {
    try {
      await tablesDB.deleteRow(DATABASE_ID, TABLE_ID, id);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    let unsubscribe;

    const channel = `databases.${DATABASE_ID}.tables.${TABLE_ID}.rows`;

    if (user) {
      fetchBooks();

      unsubscribe = client.subscribe(channel, (response) => {
        const { payload, events } = response;

        if (events[0].includes("create")) {
          setBooks((prevBooks) => [...prevBooks, payload]);
        }

        if (events[0].includes("delete")) {
          setBooks((prevBooks) =>
            prevBooks.filter((book) => book.$id !== payload.$id),
          );
        }
      });
    } else {
      setBooks([]);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return (
    <BooksContext.Provider
      value={{
        books,
        createBook,
        fetchBooks,
        fetchBookById,
        deleteBook,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}
