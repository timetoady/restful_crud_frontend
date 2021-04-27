import {
  returnDateFrom,
  returnDateTo,
  getAuthors,
  getGenres,
} from "../utilities";
import { tryCatchQL } from '../api'

let mangaDB = 'https://manga-graphql3.herokuapp.com/'

export const ALL_MANGA = `
query allManga{
  allManga{
    title
    title_english
    title_japanese
    ongoing
    publishedFrom
    publishedTo
    image_url
    id
    synopsis
    volumes
    author
    genres
    favorite
  }
}
`;

export const CHANGE_MANGA = `
mutation updateManga ($id: Int!, $title: String!, $synopsis: String, $volumes: Int, $chapters: Int, $ongoing: Boolean, ) {
  updateCourse (id: $id,
    data: { 
    title: $title,
    synopsis: $synopsis,
    volumes: $volumes,
    chapters: $chapters,
    ongoing: $ongoing,
    }
  ) {
      id
  }
}

`;

export const addManga = async (input) => {
  
  const data = {
    title: input.title,
    author: getAuthors(input.authors),
    image_url: input.image_url,
    title_english: input.title_english,
    title_japanese: input.title_japanese,
    publishedFrom: returnDateFrom(input.published).toISOString(),
    publishedTo: returnDateTo(input.published),
    ongoing: input.publishing,
    volumes: input.volumes,
    synopsis: input.synopsis,
    chapters: input.chapters,
    favorite: false,
    genres: getGenres(input.genres),
  };
  const NEW_MANGA = `
    mutation addAManga{
      addManga(
        data: {
          title: "${data.title}",
          author: "${data.author}",
          image_url: "${data.image_url}",
          title_japanese: "${data.title_japanese}",
          title_english: "${data.title_english}",
          ongoing: ${data.ongoing},
          synopsis: "${data.synopsis.replace(/"/g, "'")}",
          publishedFrom: "${data.publishedFrom}",
          publishedTo: ${data.publishedTo === null ? null : `"${data.publishedTo.toISOString()}"`},
          volumes: ${data.volumes},
          chapters: ${data.chapters},
          genres: "${data.genres}"
      }, 
        )
     {
      title
      author
      id
    }
    }`;
    console.log(NEW_MANGA)
    let madeAnAuthor = await tryCatchQL(mangaDB, NEW_MANGA);
    console.log(madeAnAuthor)
    return madeAnAuthor
};

export const editManga = async (input) => {
  const data = {
    title: input.title,
    id: input.id,
    author: input.author,
    image_url: input.image_url,
    ongoing: input.ongoing,
    volumes: input.volumes,
    synopsis: input.synopsis,
    chapters: input.chapters,
    favorite: input.favorite,
    //genres: getGenres(input.genres),
  };
  const EDIT_MANGA = `
    mutation editAManga{
      updateManga(id: ${data.id},
        data: {
          title: "${data.title}",
          author: "${data.author}",
          image_url: "${data.image_url}",
          ongoing: ${data.ongoing},
          favorite: ${data.favorite}
          synopsis: "${data.synopsis.replace(/"/g, "'")}",
          volumes: ${data.volumes},
          chapters: ${data.chapters},

      }, 
        )
     {
      title
      author
      id
    }
    }`;
    console.log(EDIT_MANGA)
    let editedAManga = await tryCatchQL(mangaDB, EDIT_MANGA);
    console.log(editedAManga)
    return editedAManga
};

// export const mangaDetail = async () => {

// }