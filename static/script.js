document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".prediction-form");
    const themeToggle = document.getElementById("themeToggle");
    const themeLabel = document.getElementById("themeLabel");

    const applyTheme = (theme) => {
        document.body.classList.toggle("light-mode", theme === "light");
        document.documentElement.style.colorScheme = theme;
        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(theme === "light"));
        }
        if (themeLabel) {
            themeLabel.textContent = theme === "light" ? "Light" : "Dark";
        }
        localStorage.setItem("heart-theme", theme);
    };

    const savedTheme = localStorage.getItem("heart-theme") || "dark";
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
            applyTheme(nextTheme);
        });
    }

    if (!form) {
        return;
    }

    // Transform native selects into custom styled dropdowns to completely remove native white popups
    const selects = form.querySelectorAll("select");
    selects.forEach((select) => {
        const wrapper = document.createElement("div");
        wrapper.className = "custom-select-wrapper";
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        select.classList.add("visually-hidden-select");

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "custom-select-trigger";
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");

        const label = document.createElement("span");
        label.className = "custom-select-label";
        const selectedOption = select.options[select.selectedIndex] || select.options[0];
        label.textContent = selectedOption ? selectedOption.textContent : "Select";

        const arrow = document.createElement("span");
        arrow.className = "custom-select-arrow";
        arrow.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        trigger.appendChild(label);
        trigger.appendChild(arrow);
        wrapper.appendChild(trigger);

        const dropdown = document.createElement("div");
        dropdown.className = "custom-select-dropdown";
        dropdown.setAttribute("role", "listbox");

        Array.from(select.options).forEach((opt, idx) => {
            const item = document.createElement("div");
            item.className = "custom-option";
            item.setAttribute("role", "option");
            item.dataset.value = opt.value;
            item.textContent = opt.textContent;
            if (idx === select.selectedIndex && opt.value !== "") {
                item.classList.add("selected");
            }

            item.addEventListener("click", (e) => {
                e.stopPropagation();
                select.value = opt.value;
                label.textContent = opt.textContent;
                dropdown.querySelectorAll(".custom-option").forEach((o) => o.classList.remove("selected"));
                if (opt.value !== "") {
                    item.classList.add("selected");
                }
                closeAllCustomSelects();
                validateField(select);
                select.dispatchEvent(new Event("change", { bubbles: true }));
            });

            dropdown.appendChild(item);
        });

        wrapper.appendChild(dropdown);

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains("open");
            closeAllCustomSelects();
            if (!isOpen) {
                wrapper.classList.add("open");
                trigger.setAttribute("aria-expanded", "true");
                const formGroup = wrapper.closest(".form-group");
                if (formGroup) {
                    formGroup.classList.add("has-open-select");
                }
            }
        });
    });

    function closeAllCustomSelects() {
        document.querySelectorAll(".custom-select-wrapper.open").forEach((w) => {
            w.classList.remove("open");
            w.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
            w.closest(".form-group")?.classList.remove("has-open-select");
        });
    }

    document.addEventListener("click", () => {
        closeAllCustomSelects();
    });

    const fields = form.querySelectorAll("input, select");

    fields.forEach((field) => {
        field.addEventListener("blur", () => validateField(field));
        field.addEventListener("input", () => {
            if (field.classList.contains("invalid")) {
                validateField(field);
            }
        });
        field.addEventListener("change", () => {
            validateField(field);
        });
    });

    form.addEventListener("submit", (event) => {
        let isValid = true;
        let firstInvalidField = null;

        fields.forEach((field) => {
            if (!validateField(field)) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        if (!isValid) {
            event.preventDefault();
            if (firstInvalidField) {
                const trigger = firstInvalidField.closest(".form-group")?.querySelector(".custom-select-trigger");
                if (trigger) {
                    trigger.focus();
                } else {
                    firstInvalidField.focus();
                }
            }
        }
    });

    function validateField(field) {
        const value = field.value.trim();
        let valid = true;

        if (field.hasAttribute("required") && value === "") {
            valid = false;
        }

        if (field.type === "number") {
            const min = field.min !== "" ? Number(field.min) : null;
            const max = field.max !== "" ? Number(field.max) : null;
            const numericValue = Number(value);

            if (value !== "" && (!Number.isFinite(numericValue) || (min !== null && numericValue < min) || (max !== null && numericValue > max))) {
                valid = false;
            }
        }

        field.classList.toggle("invalid", !valid);
        const trigger = field.closest(".form-group")?.querySelector(".custom-select-trigger");
        if (trigger) {
            trigger.classList.toggle("invalid", !valid);
        }
        return valid;
    }
});
