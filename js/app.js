let currentPage = 1;
const username = 'johnpapa';
let totalPages = 1;
const reposPerPage = 10;
let totalRepositories = 0;

const fetchAndDisplayUserInfo = async (username) => {
  const token = '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'; // Replace with your personal access token
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${token}`
      }
    });
    const userData = await response.json();
    displayUserInfo(userData);
  } catch (error) {
    console.error('Error fetching user information:', error);
  }
};

const displayUserInfo = (userData) => {
  const userInfoContainer = document.getElementById('leftSide');
  const rightSide = document.getElementById('rightSide');
  userInfoContainer.innerHTML = `
    <img id="userImg" src="${userData.avatar_url}"
    <a id="userlinktxt" style="text-decoration: none;
    color: black;
    margin-top: 20%;
    font-size: 110%;
    font-weight: bold;">${userData.html_url}</a>
  `;

  rightSide.innerHTML = `
  <h2 id="usernametxt">${userData.name || userData.login}</h2>
  <h3 id="userbiotxt">${userData.bio || 'No bio available'}</h3>
  <h3 id="userlocattxt">${userData.location || 'No location available'}</h3>
  <h3 id="userlinktxt">https://twitter.com/${userData.twitter_username || 'No link available'}</h3>
  `
};

// Call the fetchAndDisplayUserInfo function with the desired username
fetchAndDisplayUserInfo(username);

// Function to fetch repositories and update pagination information
const fetchAndDisplayRepositories = async (username, page) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=200`, {
        headers: {
          Authorization: 'token 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'
        }
      });

      const data = await response.json();
      totalRepositories = data.length; // Count the total number of repositories
      totalPages = Math.ceil(totalRepositories / reposPerPage); // Calculate the total number of pages
      data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      // Fetch topics for each repository
    await Promise.all(data.map(async (repo) => {
      const topicsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/topics`, {
        headers: {
          Authorization: 'token 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',
          Accept: "application/vnd.github.mercy-preview+json"
        }
      });
      const topicsData = await topicsResponse.json();
      repo.topics = topicsData.names;
    }));

      displayRepositories(data.slice((page - 1) * reposPerPage, page * reposPerPage)); // Display repositories for the current page
      updatePaginationInfo();
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

// Function to display repositories
const displayRepositories = (repositories) => {
    document.getElementById('cardContainer').innerHTML = ''; // Clear previous repositories
    
    while (classContainer.firstChild) {
        classContainer.removeChild(classContainer.firstChild);
      }

    repositories.forEach(repo => {
    // Create and append the card HTML for each repository
    const card = document.createElement('div');
    card.classList.add('card');
    card.id = `card`; // Assigning a unique ID based on the repository ID
    const topics = repo.topics.map(topic => `<span class="topic">${topic}</span>`).join('');

    card.innerHTML = `
      <h2 id="cardtitle">${repo.name}</h2>
      <h3 id="carddesc">${repo.description || 'No description available'}</h3>
      <div class="topics-container" style="margin-top: 20px;">
        <h3 id="cardtopics"></h3>
        <div class="topics">${topics}</div>
      </div>
    `;
    document.getElementById('cardContainer').appendChild(card);
  });
};

// Function to update pagination information
const updatePaginationInfo = () => {
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');

  if (currentPage === 1) {
    prevPageBtn.disabled = true; // Disable the "Previous" button on the first page
  } else {
    prevPageBtn.disabled = false;
  }

  if (currentPage === totalPages) {
    nextPageBtn.disabled = true; // Disable the "Next" button on the last page
  } else {
    nextPageBtn.disabled = false;
  }
    document.getElementById('paginationInfo').innerText = `Page ${currentPage} of ${totalPages}`;
  };
  
  // Initial fetch and display of repositories
  fetchAndDisplayRepositories(username, currentPage);
  
  // Event listeners for pagination buttons
  document.getElementById('nextPageBtn').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchAndDisplayRepositories(username, currentPage);
    }
  });
  
  document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchAndDisplayRepositories(username, currentPage);
    }
  });

  // Assuming you have an array of repository names called 'repositoryNames'
  const fetchRepositoryNames = async (username) => {
    const token = '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';
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=200`, {
        headers: {
          Authorization: `token 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`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
      }
      const repositories = await response.json();
      if (!Array.isArray(repositories)) {
        throw new Error('Invalid response: repositories is not an array');
      }
      const repositoryNames = repositories.map(repo => repo.name);
      return repositoryNames;
    } catch (error) {
      console.error('Error fetching repository names:', error);
      return [];
    }
  };

  const searchBar = document.getElementById('searchBar');
  const autocompleteResults = document.getElementById('autocompleteResults');

// Event listener for the focus event on the search input
searchBar.addEventListener('focus', () => {
  autocompleteResults.style.display = 'block'; // Show the cardContainer when the search input is focused
});

// Event listener for the blur event on the search input
searchBar.addEventListener('blur', () => {
  autocompleteResults.style.display = 'none'; // Hide the cardContainer when the search input loses focus
});
  
  // Function to update autocomplete results based on the search input
  const updateAutocomplete = async (searchTerm) => {
    autocompleteResults.innerHTML = '';
    autocompleteResults.style.display = 'block';
    const repositoryNames = await fetchRepositoryNames(username); // Replace 'your_username' with the GitHub username
    const filteredRepositories = repositoryNames.filter(repo =>
      repo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filteredRepositories.forEach(repo => {
      const autocompleteItem = document.createElement('div');
      autocompleteItem.classList.add('autocomplete-item');
      autocompleteItem.textContent = repo;
      autocompleteItem.addEventListener('click', () => {
        searchBar.value = repo;
        autocompleteResults.innerHTML = '';
      });
      autocompleteResults.appendChild(autocompleteItem);
    });
  };
  
  // Event listener for the search input
  searchBar.addEventListener('input', () => {
    const searchTerm = searchBar.value;
    if (searchTerm.length > 0) {
      updateAutocomplete(searchTerm);
    } else {
      autocompleteResults.style.display = 'none';
      autocompleteResults.innerHTML = '';
    }
  });
  
  // Function to filter repositories and display them
  const filterRepositories = (searchTerm) => {
    const filteredRepositories = allRepositories.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayRepositories(filteredRepositories);
  };