import { Component } from "./component";
import { Dropdown } from "./dropdown";
import { M } from "./global";

let _defaults = {
  classes: '',
  dropdownOptions: {}
};

type ValueStruct = {
  el: any,
  optionEl: HTMLOptionElement,
}

  export class FormSelect extends Component {
    el: HTMLSelectElement;
    isMultiple: boolean;
    private _values: ValueStruct[];
    labelEl: HTMLLabelElement;
    //private _labelFor: boolean;
    dropdownOptions: HTMLUListElement;
    input: HTMLInputElement;
    dropdown: Dropdown;
    wrapper: HTMLDivElement;
    selectOptions: HTMLElement[];
    private _handleSelectChangeBound: any;
    private _handleOptionClickBound: any;
    private _handleInputClickBound: any;

    constructor(el, options) {
      super(FormSelect, el, options);
      if (this.el.classList.contains('browser-default')) return;
      (this.el as any).M_FormSelect = this;
      this.options = {...FormSelect.defaults, ...options};
      this.isMultiple = this.el.multiple;
      this.el.tabIndex = -1;
      this._values = [];
      //this.labelEl = null;
      //this._labelFor = false;
      this._setupDropdown();
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_FormSelect;
    }

    destroy() {
      // Returns label to its original owner
      //if (this._labelFor) this.labelEl.setAttribute("for", this.el.id);
      this._removeEventHandlers();
      this._removeDropdown();
      (this.el as any).M_FormSelect = undefined;
    }

    _setupEventHandlers() {
      this._handleSelectChangeBound = this._handleSelectChange.bind(this);
      this._handleOptionClickBound = this._handleOptionClick.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);
      this.dropdownOptions.querySelectorAll('li:not(.optgroup)').forEach((el) => {
        el.addEventListener('click', this._handleOptionClickBound);
        el.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === " " || e.key === "Enter") this._handleOptionClickBound(e);
        });
      });
      this.el.addEventListener('change', this._handleSelectChangeBound);
      this.input.addEventListener('click', this._handleInputClickBound);
    }

    _removeEventHandlers() {
      this.dropdownOptions.querySelectorAll('li:not(.optgroup)').forEach((el) => {
        el.removeEventListener('click', this._handleOptionClickBound);
      });
      this.el.removeEventListener('change', this._handleSelectChangeBound);
      this.input.removeEventListener('click', this._handleInputClickBound);
    }

    _handleSelectChange(e) {
      this._setValueToInput();
    }

    _handleOptionClick(e) {
      e.preventDefault();
      const virtualOption = e.target.closest('li');
      this._selectOptionElement(virtualOption);
      e.stopPropagation();
    }

    _arraysEqual(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;
      return true;
    }

    _selectOptionElement(virtualOption: HTMLElement) {
      if (!virtualOption.classList.contains('disabled') && !virtualOption.classList.contains('optgroup')) {
        const value = this._values.find((value) => value.optionEl === virtualOption);
        const previousSelectedValues = this.getSelectedValues();
        if (this.isMultiple) {
          // Multi-Select
          this._toggleEntryFromArray(value);
        }
        else {
          // Single-Select
          this._deselectAll();
          this._selectValue(value);
        }
        // Refresh Input-Text
        this._setValueToInput();
        // Trigger Change-Event only when data is different
        const actualSelectedValues = this.getSelectedValues();
        const selectionHasChanged = !this._arraysEqual(
          previousSelectedValues,
          actualSelectedValues
        );
        if (selectionHasChanged) this.el.dispatchEvent(new Event('change')); // trigger('change');
      }
      if (!this.isMultiple) this.dropdown.close();
    }

    _handleInputClick() {
      if (this.dropdown && this.dropdown.isOpen) {  
        this._setValueToInput();
        this._setSelectedStates();
      }
    }

    _setupDropdown() {
      // Get Label
      this.labelEl = this.el.parentElement.querySelector('label');

      // Create Wrapper
      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('select-wrapper', 'input-field');
      if (this.options.classes.length > 0) {
        this.wrapper.classList.add(this.options.classes.split(' '));
      }
      this.el.before(this.wrapper);

      // Move actual select element into overflow hidden wrapper
      const hideSelect = document.createElement('div');
      hideSelect.classList.add('hide-select');
      this.wrapper.append(hideSelect);
      hideSelect.appendChild(this.el);

      if (this.el.disabled) this.wrapper.classList.add('disabled');

      this.selectOptions = <HTMLElement[]>Array.from(this.el.children).filter(el => ['OPTION','OPTGROUP'].includes(el.tagName));
      
      // Create dropdown
      this.dropdownOptions = document.createElement('ul');
      this.dropdownOptions.id = `select-options-${M.guid()}`;
      this.dropdownOptions.classList.add('dropdown-content', 'select-dropdown');
      this.dropdownOptions.setAttribute('role', 'listbox');
      this.dropdownOptions.ariaMultiSelectable = this.isMultiple.toString();
      if (this.isMultiple) this.dropdownOptions.classList.add('multiple-select-dropdown');

      // Create dropdown structure
      if (this.selectOptions.length > 0) {
        this.selectOptions.forEach((realOption) => {
          if (realOption.tagName === 'OPTION') {
            // Option
            const virtualOption = this._createAndAppendOptionWithIcon(realOption, this.isMultiple ? 'multiple' : undefined);
            this._addOptionToValues(realOption, virtualOption);
          }
          else if (realOption.tagName === 'OPTGROUP') {
            // Optgroup            
            const groupId = "opt-group-"+M.guid();            
            const groupParent = document.createElement('li');
            groupParent.classList.add('optgroup');
            groupParent.tabIndex = -1;
            groupParent.setAttribute('role', 'group');
            groupParent.setAttribute('aria-labelledby', groupId);
            groupParent.innerHTML = `<span id="${groupId}" role="presentation">${realOption.getAttribute('label')}</span>`;
            this.dropdownOptions.append(groupParent);
            
            const groupChildren = [];
            const selectOptions = <HTMLOptionElement[]>Array.from(realOption.children).filter(el => el.tagName === 'OPTION');
            selectOptions.forEach(realOption => {
              const virtualOption = this._createAndAppendOptionWithIcon(realOption, 'optgroup-option');
              const childId = "opt-child-"+M.guid();
              virtualOption.id = childId;
              groupChildren.push(childId);
              this._addOptionToValues(realOption, virtualOption);
            });
            groupParent.setAttribute("aria-owns", groupChildren.join(" "));
          }
        });
      }
      this.wrapper.append(this.dropdownOptions);

      // Add input dropdown
      this.input = document.createElement('input');
      this.input.id = "m_select-input-" + M.guid();
      this.input.classList.add('select-dropdown', 'dropdown-trigger');
      this.input.type = 'text';
      this.input.readOnly = true;
      this.input.setAttribute('data-target', this.dropdownOptions.id);
      this.input.ariaReadOnly = 'true';
      this.input.ariaRequired = this.el.hasAttribute("required").toString(); //setAttribute("aria-required", this.el.hasAttribute("required"));
      if (this.el.disabled) this.input.disabled = true; // 'true');

      // Place Label after input
      if (this.labelEl) {
        this.input.after(this.labelEl);      
        this.labelEl.setAttribute('for', this.input.id);
        this.labelEl.id = "m_select-label-" + M.guid();      
        this.dropdownOptions.setAttribute("aria-labelledby", this.labelEl.id);
      }

      // Makes new element to assume HTML's select label and aria-attributes, if exists
      /*
      if (this.el.hasAttribute("aria-labelledby")){
        console.log(1);
        this.labelEl = <HTMLLabelElement>document.getElementById(this.el.getAttribute("aria-labelledby"));
      }
      else if (this.el.id != ""){
        console.log(2);
        const label = document.createElement('label');
        label.setAttribute('for', this.el.id);
        if (label){
          this.labelEl = label;
          this.labelEl.removeAttribute("for");
          this._labelFor = true;
        }
      }
      */
      // Tries to find a valid label in parent element
      // if (!this.labelEl) {
      //   this.labelEl = this.el.parentElement.querySelector('label');
      // }
      // if (this.labelEl && this.labelEl.id == "") {
      //   this.labelEl.id = "m_select-label-" + M.guid();
      // }
      // if (this.labelEl) {
      //   this.labelEl.setAttribute("for", this.input.id);
      //   this.dropdownOptions.setAttribute("aria-labelledby", this.labelEl.id);
      // }
      // else
      //   this.dropdownOptions.ariaLabel = '';

      const attrs = this.el.attributes;
      for (let i = 0; i < attrs.length; ++i){
        const attr = attrs[i];
        if (attr.name.startsWith("aria-"))
          this.input.setAttribute(attr.name, attr.value);
      }

      // Adds aria-attributes to input element
      this.input.setAttribute('role', 'combobox');
      this.input.ariaExpanded = 'false';
      this.input.setAttribute("aria-owns", this.dropdownOptions.id);
      this.input.setAttribute("aria-controls", this.dropdownOptions.id);
      this.input.placeholder = " ";

      this.wrapper.prepend(this.input);
      this._setValueToInput();

      // Add caret
      const dropdownIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); //document.createElement('svg')
      dropdownIcon.classList.add('caret');
      dropdownIcon.setAttribute('height', '24');
      dropdownIcon.setAttribute('width', '24');
      dropdownIcon.setAttribute('viewBox', '0 0 24 24');
      dropdownIcon.ariaHidden = 'true';
      dropdownIcon.innerHTML = `<path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/>`;
      this.wrapper.prepend(dropdownIcon);

      // Initialize dropdown
      if (!this.el.disabled) {
        const dropdownOptions = {...this.options.dropdownOptions}; // TODO:
        dropdownOptions.coverTrigger = false;
        const userOnOpenEnd = dropdownOptions.onOpenEnd;
        const userOnCloseEnd = dropdownOptions.onCloseEnd;
        // Add callback for centering selected option when dropdown content is scrollable
        dropdownOptions.onOpenEnd = (el) => {
          const selectedOption = this.dropdownOptions.querySelector('.selected');
          if (selectedOption) {
            // Focus selected option in dropdown
            M.keyDown = true;
            this.dropdown.focusedIndex = [...selectedOption.parentNode.children].indexOf(selectedOption);
            this.dropdown._focusFocusedItem();
            M.keyDown = false;
            // Handle scrolling to selected option
            if (this.dropdown.isScrollable) {
              let scrollOffset =
                selectedOption.getBoundingClientRect().top -
                (this.dropdownOptions as HTMLElement).getBoundingClientRect().top; // scroll to selected option
              scrollOffset -= this.dropdownOptions.clientHeight / 2; // center in dropdown
              this.dropdownOptions.scrollTop = scrollOffset;
            }
          }
          this.input.ariaExpanded = 'true';
          // Handle user declared onOpenEnd if needed
          if (userOnOpenEnd && typeof userOnOpenEnd === 'function')
            userOnOpenEnd.call(this.dropdown, this.el);
        };
        // Add callback for reseting "expanded" state
        dropdownOptions.onCloseEnd = (el) => {
          this.input.ariaExpanded = 'false';
          // Handle user declared onOpenEnd if needed
          if (userOnCloseEnd && typeof userOnCloseEnd === 'function')
            userOnCloseEnd.call(this.dropdown, this.el);
        };
        // Prevent dropdown from closing too early
        dropdownOptions.closeOnClick = false;
        this.dropdown = M.Dropdown.init(this.input, dropdownOptions);
      }
      // Add initial selections
      this._setSelectedStates();

      // ! Workaround for Label: move label up again
      if (this.labelEl) this.input.after(this.labelEl);
    }

    _addOptionToValues(realOption, virtualOption) {
      this._values.push({ el: realOption, optionEl: virtualOption });
    }

    _removeDropdown() {
      this.wrapper.querySelector('.caret').remove();
      this.input.remove();
      this.dropdownOptions.remove();
      this.wrapper.before(this.el);
      this.wrapper.remove();
    }

    _createAndAppendOptionWithIcon(realOption, type: string) {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      if (realOption.disabled){
        li.classList.add('disabled');
        li.ariaDisabled = 'true';
      }
      if (type === 'optgroup-option') li.classList.add(type);
      // Text / Checkbox
      const span = document.createElement('span');
      if (this.isMultiple)
        span.innerHTML = `<label><input type="checkbox"${
          realOption.disabled ? ' disabled="disabled"' : ''
        }><span>${realOption.innerHTML}</span></label>`;
      else
        span.innerHTML = realOption.innerHTML;
      li.appendChild(span);
      // add Icon
      const iconUrl = realOption.getAttribute('data-icon');
      const classes = realOption.getAttribute('class')?.split();
      if (iconUrl) {
        const img = document.createElement('img');
        if (classes) img.classList.add(classes);
        img.src = iconUrl;
        img.ariaHidden = 'true';
        li.prepend(img);
      }
      // Check for multiple type
      this.dropdownOptions.append(li);
      return li;
    }

    _selectValue(value) {
      value.el.selected = true;
      value.optionEl.classList.add('selected');
      value.optionEl.ariaSelected = 'true'; // setAttribute("aria-selected", true);
      const checkbox = value.optionEl.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = true;
    }

    _deselectValue(value) {
      value.el.selected = false;
      value.optionEl.classList.remove('selected');
      value.optionEl.ariaSelected = 'false'; //setAttribute("aria-selected", false);
      const checkbox = value.optionEl.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = false;
    }

    _deselectAll() {
      this._values.forEach(value => this._deselectValue(value));
    }

    _isValueSelected(value) {
      const realValues = this.getSelectedValues();
      return realValues.some((realValue) => realValue === value.el.value);
    }

    _toggleEntryFromArray(value) {
      if (this._isValueSelected(value))
        this._deselectValue(value);
      else
        this._selectValue(value);
    }

    _getSelectedOptions() {
      // remove null, false, ... values
      return Array.prototype.filter.call(this.el.selectedOptions, (realOption) => realOption);
    }

    _setValueToInput() {
      const realOptions = this._getSelectedOptions();
      const values = this._values.filter((value) => realOptions.indexOf(value.el) >= 0);
      const texts = values.map((value) => value.optionEl.querySelector('span').innerText.trim());
      // Set input-text to first Option with empty value which indicates a description like "choose your option"
      if (texts.length === 0) {
        const firstDisabledOption = <HTMLOptionElement>this.el.querySelector('option:disabled');
        if (firstDisabledOption && firstDisabledOption.value === '') {
          this.input.value = firstDisabledOption.innerText;
          return;
        }
      }
      this.input.value = texts.join(', ');
    }

    _setSelectedStates() {
      this._values.forEach((value) => {
        const optionIsSelected = value.el.selected;
        const cb = <HTMLInputElement>value.optionEl.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = optionIsSelected;
        if (optionIsSelected) {
          this._activateOption(this.dropdownOptions, value.optionEl);
        }
        else {
          value.optionEl.classList.remove('selected');
          value.optionEl.ariaSelected = 'false'; // attr("aria-selected", 'false');
        }
      });
    }

    _activateOption(ul: HTMLElement, li: HTMLElement) {
      if (!li) return;
      if (!this.isMultiple) ul.querySelectorAll('li.selected').forEach(li => li.classList.remove('selected'));
      li.classList.add('selected');
      li.ariaSelected = 'true';
    }

    getSelectedValues() {
      return this._getSelectedOptions().map((realOption) => realOption.value);
    }
  }
