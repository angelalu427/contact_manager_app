import templates from './templates.js';
import debounce from './debounce.js';

class ContactManager {
  constructor() {
    this.contacts = [];
    this.tags = [];
    this.currentTag = '';
    this.searchQuery = '';
    this.mainContent = document.querySelector('main');
    this.bindEvents();
  }

  async fetchContacts() {
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        if (response.status === 500) {
          console.warn(`Server returned: ${response.status}. No contacts exist.`);
          return;
        } else {
          throw new Error(`HTTP error: ${response.status})`);
        }
      }
      this.contacts = await response.json();
    } catch (error) {
      console.error(`Failed to fetch contacts: ${error}`);
    }
  }

  initializeTags() {
    this.tags = Array.from(new Set(this.contacts.flatMap(
      c => c.tags ? c.tags.split(',') : [])));
  }

  async loadData() {
    await this.fetchContacts();
    this.initializeTags();
  }

  async renderHomepage() {
    this.mainContent.innerHTML = templates.homepage({ 
      allTags: this.tags,
      searchQuery: this.searchQuery,
      currentTag: this.currentTag,
    });

    this.renderContacts();
  }

  bindEvents() {
    this.mainContent.addEventListener('submit',
      this.handleContactFormSubmit.bind(this));
    this.mainContent.addEventListener('click',
    this.handleClick.bind(this));

    this.onSearchInputChange = debounce(this.onSearchInputChange.bind(this), 300);
    this.mainContent.addEventListener('input', this.onSearchInputChange.bind(this));
    this.mainContent.addEventListener('change', this.onTagFilterChange.bind(this));

    const title = document.querySelector('header h1');
    title.addEventListener('click', this.renderHomepage.bind(this));
  }

  async refreshHomepage() {
    await this.loadData();
    await this.renderHomepage();
  }

  async handleClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.classList.contains('toolbar-btn')) {
      this.handleToolbarClick(button);
    } else if (button.classList.contains('contact-action-btn')) {
      this.handleContactCardsClick(button);
    } else if (button.classList.contains('cancel-btn')) {
      this.handleCancelClick();
    } else {
      return;
    }
  }

  async handleToolbarClick(button) {
    if (button.matches('#add-contact-btn')) {
      this.renderContactForm({ allTags: this.tags });
    } else if (button.matches('#add-tag-btn')) {
      const div = button.closest('#tag-action');
      this.handleNewTag();
      return;
    } 
  }
  
  async handleContactCardsClick(button) {
    const id = Number(button.getAttribute('data-id'));
    if (!id) return;

    if (button.classList.contains('edit-btn')) {
      const contact = await this.fetchContact(id);
      this.renderContactForm({
        header: 'Edit Contact',
        allTags: this.tags,
        contact,
      });
    } else if (button.classList.contains('delete-btn')) {
      const contact = this.contacts.find(c => c.id === id);
      if (!contact) return;
      await this.handleDeleteButtonClick(contact);
    }
  }

  handleCancelClick() {
    this.renderHomepage();
  }

  async fetchContact(id) {
    try {
      const response = await fetch(`/api/contacts/${id}`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Error ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Cannot find contact: ${error}`);
      return null;
    }
  }
      
  async handleDeleteButtonClick(contact) {
    if (confirm(`Do you want to delete ${contact.full_name} ?`)) {
      try {
        await this.deleteContact(contact.id);
        await this.refreshHomepage();
      } catch (error) {
        console.error(`${contact.full_name} was not found on the server.`);
        deleteBtn.closest('.contact-card').remove();
        return;
      }
    }
    return;
  }

  async deleteContact(id) {
    try {
      let response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });
      
      if (response.status === 204) {
        alert('Contact deleted.');
      } else {
        alert(await response.text());
      }
    } catch (error) {
      console.error(`Failed to delete contact: ${error}`);
    }
  }

  async handleContactFormSubmit(event) {
    if (!event.target.matches('#contact-form')) return;
    event.preventDefault();

    const form = event.target;
    const contactData = new FormData(form);
    const contact = this.processFormData(contactData);
    const id = Number(form.getAttribute('data-id'));

    if (id) {
      contact.id = id;
      await this.updateContact(id, contact);
    } else {
      await this.addContact(contact);
    }
    await this.refreshHomepage();
  }
  
  async updateContact(id, updatedContact) {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContact),
      });

      if (response.ok) {
        const contact = await response.json();
        alert(`${contact.full_name}'s information updated!`);
      } else {
        alert(`Failed to update contact: ${response.status}`);
      }
    } catch (error) {
      console.error(`Network failure: ${error}`);
    }
  }

  async addContact(contact) {
    try {
      const response = await fetch(`/api/contacts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });

      if (response.ok) {
        const contact = await response.json();
        alert(`${contact.full_name} is added!`);
      } else {
        alert(`Failed to add contact: ${response.status}`);
      }
    } catch (error) {
      console.error(`Network failure: ${error}`);
    }
  }

  renderTagFilter() {
    const tagFilter = this.mainContent.querySelector('#tag-filter');
    tagFilter.innerHTML = templates.tagFilter(this.tags, this.currentTag);
  }

  handleNewTag() {
    const newTagInput = this.mainContent.querySelector('#tag-input');
    const tag = newTagInput.value.trim().toLowerCase();
    if (!tag) {
      this.showTagMessage(`Please enter a valid tag.`, 'error');
      return;
    }

    if (this.tags.includes(tag)) {
      this.showTagMessage(`Tag <${tag}> already exists.`, 'error');
      return;
    }

    this.tags.push(tag);
    newTagInput.value = '';
    this.showTagMessage(`Tag <${tag}> created!`);
    this.renderTagFilter();
  }

  showTagMessage(text, type = 'success') {
    const tagMessageDiv = document.querySelector('#tag-msg');
    tagMessageDiv.textContent = text;
    tagMessageDiv.className = `message ${type}`;
  }

  filterContacts() {
    return this.contacts.filter(c => {
      const nameMatch = c.full_name
                        .toLowerCase()
                        .includes(this.searchQuery.toLowerCase());
      const tagMatch = this.currentTag === '' 
                    || (c.tags && c.tags.includes(this.currentTag));
      
      return nameMatch && tagMatch;
    });
  }

  renderContacts() {
    const container = this.mainContent.querySelector('#contacts-container');
    const filteredContacts = this.filterContacts();
    if (filteredContacts.length === 0) {
      const message = this.contacts.length === 0
        ? "There are no contacts."
        : "There are no matching contacts.";
      container.innerHTML = templates.emptyContactContainer(message);
    } else {
      container.innerHTML = templates.contactCards(filteredContacts);
    }
  }

  renderContactForm({ header = 'Create Contact', allTags, contact = {} }) {
    this.mainContent.innerHTML = templates.contactForm({
      header, contact, allTags,
    });
  }
  
  processFormData(contactData) {
    const contactObj = Object.fromEntries(contactData.entries());
    const tags = contactData.getAll('tags'); 

    const payload =  {
      ...contactObj,
      tags: tags.length > 0 ? tags.join(',') : null,
    }

    return payload;
  }

  onSearchInputChange(event) {
    if (!event.target.matches('#query')) return;
    this.searchQuery = event.target.value;
    this.renderContacts();
  }

  onTagFilterChange(event) {
    if (!event.target.matches('#tag-filter')) return;
    this.currentTag = event.target.value;
    this.renderContacts();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const manager = new ContactManager();
  await manager.loadData();
  await manager.renderHomepage();
});