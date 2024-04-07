class Cratf {
    constructor({
        name,
        image,
        description,
        supplies
    }) {
        this.name = name;
        this.image = image;
        this.description = description;
        this.supplies = supplies;
    }

    getSection() {
        return `<div class="tree-card" id="${this.name.replace(/\s/g, '')}">
                <h3>${this.name}</h3>
                <img src="crafts/${this.image}" alt="${this.name}">
              </div>`;
    }

    getExpandedSection(index) {
        const suppliesList = this.supplies.map(supply => `<li>${supply}</li>`).join('');
        return `
        <div id="${this.name.replace(/\s/g, '')}Modal" class="w3-modal" style="display: none;">
            <div class="w3-modal-content">
            <header class="w3-container w3-teal"> 
                <span onclick="document.getElementById('${this.name.replace(/\s/g, '')}Modal').style.display='none'"
                class="w3-button w3-display-topright">&times;</span>
                <h2>${this.name}</h2>
            </header>
            <div class="w3-container modal-content">
            <div class="hideOption">
                <div class="modal-image">
                <img src="crafts/${this.image}" alt="${this.name}" style="width:100%">
                </div>
                <div class="modal-description">
                    <p><strong>name:</strong>${this.name}</p>
                    <p><strong>description:</strong>${this.description}</p>
                    <strong>supplies:</strong><ul>${suppliesList}</ul>
                </div>
            </div>
            
            <form id="${this.name.replace(/\s/g, '')}Form" style="display: none;">
            <div class="showOption">
                <div class="modal-image2">
                    <label for="image">Image:</label>
                    <img id="${this.name.replace(/\s/g, '')}currentImage" src="crafts/${this.image}" class="currentImage" alt="Current image">
                    <input type="file" id="${this.name.replace(/\s/g, '')}imageChange" name="image" onchange="updateImageDisplay(${this.name.replace(/\s/g, '')})">
                </div>
                <div class="modal-description2">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" value="${this.name}">
                    <label for="description">Description:</label>
                    <input type="text" id="description" name="description" value="${this.description}">
                    <div id="${this.name.replace(/\s/g, '')}suppliesContainer">
                        <label for="supplies">Supplies:</label>
                        ${this.supplies.map((supply, index) => `
                            <input type="text" id="supplies" name="supply${index}" value="${supply}">
                        `).join('')}
                    </div>
                    <button type="button" id="${this.name.replace(/\s/g, '')}addSupply" onclick="addSupply(${this.name.replace(/\s/g, '')})" >Add Supply</button>
                    <input type="submit" value="Submit">
                </div>
            </div>    
            </form>
            <button id="edit" onclick="editCraft('${this.name.replace(/\s/g, '')}', ${index})">
                <i class="fa fa-edit"></i>
            </button>
            <button id="delete" onclick="deleteCraft(${index})">
                <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>`;
    }
}

function updateImageDisplay(name) {
    const input = document.getElementById(name.id + 'imageChange');
    // ButtonFlowerscurrentImage
    const currentImage = document.getElementById(name.id + 'currentImage');
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function addSupply(name) {
    const supplies = document.getElementById(name.id + 'suppliesContainer');
    const supply = document.createElement('input');
    supply.type = 'text';
    supply.name = 'supply';
    supplies.appendChild(supply);
}

fetch('/api/crafts')
    .then(response => response.json())
    .then(data => {
        let trees = data.map(item => new Cratf(item));
        displayTrees(trees);
        addModalListeners(trees);
    })
    .catch(error => console.error('Error:', error));

function displayTrees(trees) {
    if (!Array.isArray(trees)) {
        console.error('Invalid argument: trees must be an array');
        return;
    }

    const container = document.getElementById('tree-container');
    let treeHTML = '';
    let modalHTML = '';
    trees.forEach((tree, index) => {
        treeHTML += tree.getSection();
        modalHTML += tree.getExpandedSection(index);
    });
    container.innerHTML = treeHTML;
    document.body.innerHTML += modalHTML;
}

function addModalListeners(trees) {
    if (!Array.isArray(trees)) {
        console.error('Invalid argument: trees must be an array');
        return;
    }

    trees.forEach(tree => {
        const treeElement = document.getElementById(tree.name.replace(/\s/g, ''));
        treeElement.onclick = () => {
            document.getElementById(tree.name.replace(/\s/g, '') + 'Modal').style.display = 'block';
        };
    });
}

function editCraft(name, id) {
    const hideOption = document.getElementsByClassName('hideOption');
    for (let i = 0; i < hideOption.length; i++) {
        hideOption[i].style.display = 'none';
    }
    const form = document.getElementById(name + 'Form');
    form.style.display = 'block';
    form.onsubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // clean form data
        const req = {
            name: data.name,
            image: formData.get('image'), // get the File object from formData
            description: data.description,
            supplies: []
        };

        const suppliesContainer = document.getElementById(name + 'suppliesContainer');
        const supplyInputs = suppliesContainer.querySelectorAll('input');

        for (let i = 0; i < supplyInputs.length; i++) {
            if (supplyInputs[i].value !== '') {
                req.supplies.push(supplyInputs[i].value);
            }
        }

        if (req.image === '') {
            alert('Please select an image');
            return;
        }

        const data1 = new FormData();
        data1.append('name', req.name);
        data1.append('description', req.description);
        data1.append('image', req.image); // append the File object to formData
        data1.append('supplies', JSON.stringify(req.supplies));

        fetch('/api/crafts/' + id, {
            method: 'PUT',
            body: data1
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            document.getElementById(name + 'Modal').style.display='none'

            location.reload();
        
        }).finally(() => {
            document.getElementById(name + 'Modal').style.display='none'

            location.reload();
        });

    };
}

function deleteCraft(index) {
    if (confirm('Are you sure you want to delete this craft?')) {
        // User clicked "OK", proceed with deletion
        // Your deletion code here
        fetch('/api/crafts/' + index, {
            method: 'DELETE'
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            console.log('Success:', data);
            location.reload();
        }).catch((error) => {
            console.error('Error:', error);
            location.reload();
        });
    }
    
}

