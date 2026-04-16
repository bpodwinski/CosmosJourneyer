//  This file is part of Cosmos Journeyer
//
//  Copyright (C) 2024 Barthélemy Paléologue <barth.paleologue@cosmosjourneyer.com>
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Affero General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Affero General Public License for more details.
//
//  You should have received a copy of the GNU Affero General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

import i18n from "@/i18n";

export class AboutPanel {
    readonly htmlRoot: HTMLElement;

    constructor() {
        this.htmlRoot = this.createPanelHTML();
    }

    private createPanelHTML(): HTMLElement {
        const panel = document.createElement("div");
        panel.className = "sidePanel";

        // Create title
        const title = document.createElement("h2");
        title.textContent = i18n.t("sidePanel:about");
        panel.appendChild(title);

        // About text
        const aboutText = document.createElement("p");
        aboutText.className = "aboutText";
        aboutText.style.whiteSpace = "pre-line"; // necessary to display \n in the text
        aboutText.textContent = i18n.t("sidePanel:aboutText");
        panel.appendChild(aboutText);

        // Signature
        const signature = document.createElement("p");
        signature.className = "signature";
        signature.textContent = i18n.t("sidePanel:signature");
        panel.appendChild(signature);

        // Contact email
        const emailText = document.createElement("p");
        emailText.className = "aboutText";
        emailText.style.whiteSpace = "pre-line"; // necessary to display \n in the text
        emailText.innerHTML = i18n.t("sidePanel:emailContact");
        panel.appendChild(emailText);

        // Special thanks section
        const specialThanksHeader = document.createElement("h3");
        specialThanksHeader.textContent = i18n.t("sidePanel:specialThanks");
        panel.appendChild(specialThanksHeader);

        const specialThanks = [
            i18n.t("sidePanel:specialThanks1"),
            i18n.t("sidePanel:specialThanks2"),
            i18n.t("sidePanel:specialThanks3"),
            i18n.t("sidePanel:specialThanks4"),
            i18n.t("sidePanel:specialThanks5"),
        ];

        specialThanks.forEach((thanks) => {
            const p = document.createElement("p");
            p.textContent = thanks;
            panel.appendChild(p);
        });

        return panel;
    }
}
