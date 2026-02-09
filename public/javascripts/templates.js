const templates = {
  homepage({ allTags, searchQuery, currentTag }) {
    return `
      <section id="toolbar">
        <button class='toolbar-btn' id="add-contact-btn">Add Contact</button>
        <div id="tag-action">
          <input type="text" name="tag-input" id="tag-input" placeholder="New tag">
          <button class='toolbar-btn' id="add-tag-btn">Create Tag</button>
          <div id="tag-msg"></div>
        </div>
      </section>

      <section class="filters" id="contact-filters">
        <div id="tag-filter">${this.tagFilter(allTags, currentTag)}</div>
        <div id="name-filter">
          <label for="query">Search by name:</label>
          <input 
            type="text"
            name="query"
            id="query"
            placeholder="Name"
            value="${searchQuery}"
          >
        </div>
      </section>

      <section id="contacts-container"></section>
    `
  },
  
  tagFilter(allTags, currentTag = '') {
    return `
      <label for="tag-filter">Filter by tag:</label>
      <select id="tag-filter" name="tag-filter">
        <option value="" ${currentTag === '' ? 'selected' : ''}>Any</option>
        ${allTags.map(t => `
          <option value="${t}" ${t === currentTag ? 'selected' : ''}>
            ${t}
          </option>
        `).join('')}
      </select>
    `
  },

  contactCards(contacts) {
    const cards = contacts.map(contact => {
      return `
        <section class="contact-card" data-id="${contact.id}">
          <h2>${contact.full_name}</h2>
          <div>
            <span class="card-label">Phone Number:</span>
            ${contact.phone_number}
          </div>
          <div>
            <span class="card-label">Email:</span>
            ${contact.email}
          </div>
          <div>
            <span class="card-label">Tags:</span> 
            ${contact.tags ? contact.tags.split(',').join(', ') : ''}
          </div>

          <div class="contact-actions">
            <button class="contact-action-btn edit-btn" data-id="${contact.id}">
              Edit
            </button>
            <button class="contact-action-btn delete-btn" data-id="${contact.id}">
              Delete
            </button>
          </div>
        </section>
      `
    })

    return cards.join('');
  },

  emptyContactContainer(message) {
    return `
      <div id="empty">
        <h2>${message}</h2>
      </div>
    `
  },

  contactForm({ header, allTags, contact = {} }) {
    const {
      id = '',
      full_name = '',
      email = '',
      phone_number = '',
      tags = null,
    } = contact;

    const formAction = id ? `/api/contacts/${id}` : `/api/contacts/`;
    const selectedTags = tags ? tags.split(',').filter(t => t) : [];

    return `
      <form id="contact-form" method="post" action="${formAction}" data-id="${id}">
        <h2 id="form-header">${header}</h2>
        <div>
          <label for="name">Full name:</label>
          <input type="text" name="full_name" id="full_name" value="${full_name}" required>
        </div>
        <div>
          <label for="email">Email address:</label>
          <input type="email" name="email" id="email" value="${email}" required>
        </div>
        <div>
          <label for="telephone">Telephone number:</label>
          <input type="tel" name="phone_number" id="phone_number" value="${phone_number}" required>
        </div>
        ${this.tagsCheckboxes({ allTags, selectedTags })}
        <div id="contact-form-controls">
          <button type="submit" data-action="${id ? 'add' : 'edit'}">Submit</button>
          <button type="button" class="cancel-btn">Cancel</button>
        </div>
      </form>
    `
  },

  tagsCheckboxes({ allTags, selectedTags = [] }) {
    return `
      <fieldset>
          <legend>Add tags to contact:</legend>
          <div>
            ${allTags.map(t => `
              <input type="checkbox" name="tags" value="${t}" id="tag-${t}"
              ${selectedTags.includes(t) ? 'checked' : ''}>
              <label for="tag-${t}">${t}</label>
            `).join('')}
          </div>
      </fieldset>
    `
  },
}

export default templates;