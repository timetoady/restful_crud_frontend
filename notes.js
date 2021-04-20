//Examples of queries for front end to server
//Will likely have to make another axios call
//Need to set up svelte router, add manga page

//Here, use updated tryCatch to include data payload. Went over in class 04/19.
const setCurrent = async () => {
    initialSpinner = true;
    let animeSets = await tryCatch(
      "https://manga-graphql2.herokuapp.com/"
    );
    currentAnime.set(animeSets);
    initialSpinner = false;
  };

import { useQuery, useMutation, gql } from '@apollo/client'
const ALL_COURSES = gql`
  query {
    allCourses {
      id
      title
      description
      defaultCredits
      courseCode
    }
  }
`

const UPDATE_COURSE = gql`
mutation updateCourse ($id: Int!, $title: String!, $description: String, $defaultCredits: String, $courseCode: String) {
  updateCourse (id: $id,
    data: { 
    title: $title,
    description: $description,
    defaultCredits: $defaultCredits,
    courseCode: $courseCode,
    }
  ) {
      id
  }
}
`

const DELETE_COURSE = gql`
mutation deleteCourse ($id: Int!) {
  deleteCourse (id: $id) {
    id
  }
}
`