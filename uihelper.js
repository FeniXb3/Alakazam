export class UIHelper {
       
    static addPlusButton(element) {
        // https://www.svgrepo.com/svg/158248/round-add-button
        const plusSVG = `
            <svg class="add-node" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path d="M16,0C7.164,0,0,7.164,0,16s7.164,16,16,16s16-7.164,16-16S24.836,0,16,0z M24,18h-6v6h-4v-6H8v-4
                    h6V8h4v6h6V18z"/>
                    </g>
                    </svg>`;
        element.innerHTML += plusSVG;
    }

    static addAlternatePlusButton(element) {
        // https://www.svgrepo.com/svg/158248/round-add-button
        const plusSVG = `
            <svg class="add-alternate-node" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path d="M16,0C7.164,0,0,7.164,0,16s7.164,16,16,16s16-7.164,16-16S24.836,0,16,0z M24,18h-6v6h-4v-6H8v-4
                    h6V8h4v6h6V18z"/>
                    </g>
                    </svg>`;
        element.innerHTML += plusSVG;
    }

    static addLinkButton(element) {
        // https://www.svgrepo.com/svg/126738/link
        const svg = `
            <svg transform="
        translate(-12, 10)" class="link-node" xmlns="http://www.w3.org/2000/svg">
                <g transform="

        scale(0.07)"
        s>
        <g>
<g>
<g>
    <path class="link-path inactive-button" d="M149.996,0C67.157,0,0.001,67.161,0.001,149.997S67.157,300,149.996,300s150.003-67.163,150.003-150.003
        S232.835,0,149.996,0z M225.363,123.302l-36.686,36.686c-3.979,3.979-9.269,6.17-14.895,6.17c-5.625,0-10.916-2.192-14.895-6.168
        l-1.437-1.437l-3.906,3.906l1.434,1.434c8.214,8.214,8.214,21.579,0,29.793l-36.681,36.686c-3.979,3.979-9.269,6.17-14.898,6.17
        c-5.628,0-10.919-2.192-14.9-6.173L74.634,216.5c-8.214-8.209-8.214-21.573-0.003-29.79l36.689-36.684
        c3.979-3.979,9.269-6.17,14.898-6.17s10.916,2.192,14.898,6.17l1.432,1.432l3.906-3.906l-1.432-1.432
        c-8.214-8.211-8.214-21.576-0.005-29.79l36.689-36.686c3.981-3.981,9.272-6.173,14.898-6.173s10.916,2.192,14.898,6.17
        l13.868,13.873C233.577,101.723,233.577,115.09,225.363,123.302z"/>
    <path class="link-path inactive-button"style="fill:#000000;"  d="M142.539,173.459l-7.093,7.093l-11.002-10.999l7.093-7.093l-1.432-1.432c-1.04-1.037-2.422-1.611-3.89-1.611
        c-1.471,0-2.853,0.573-3.893,1.611l-36.686,36.681c-2.145,2.147-2.145,5.638,0,7.783l13.87,13.873
        c2.083,2.083,5.708,2.08,7.786,0.003l36.681-36.686c2.148-2.147,2.148-5.641,0-7.789L142.539,173.459z"/>
    <path class="link-path inactive-button" d="M200.493,90.643c-1.04-1.04-2.425-1.613-3.896-1.613c-1.471,0-2.856,0.573-3.896,1.616l-36.686,36.684
        c-2.142,2.147-2.142,5.638,0.003,7.786l1.434,1.432l10.88-10.883l11.002,11.002l-10.88,10.883l1.434,1.434
        c2.083,2.077,5.703,2.08,7.786-0.003l36.684-36.681c2.145-2.147,2.145-5.638,0-7.786L200.493,90.643z"/>
</g>
</g>
</g>
                    </svg>`;
        element.innerHTML += svg;
    }

    
    static addAlternateLinkButton(element) {
        // https://www.svgrepo.com/svg/126738/link
        const svg = `
            <svg class="link-alternate-node" xmlns="http://www.w3.org/2000/svg">
                <g
        s>
        <g>
<g>
<g>
    <path class="link-path inactive-button" d="M149.996,0C67.157,0,0.001,67.161,0.001,149.997S67.157,300,149.996,300s150.003-67.163,150.003-150.003
        S232.835,0,149.996,0z M225.363,123.302l-36.686,36.686c-3.979,3.979-9.269,6.17-14.895,6.17c-5.625,0-10.916-2.192-14.895-6.168
        l-1.437-1.437l-3.906,3.906l1.434,1.434c8.214,8.214,8.214,21.579,0,29.793l-36.681,36.686c-3.979,3.979-9.269,6.17-14.898,6.17
        c-5.628,0-10.919-2.192-14.9-6.173L74.634,216.5c-8.214-8.209-8.214-21.573-0.003-29.79l36.689-36.684
        c3.979-3.979,9.269-6.17,14.898-6.17s10.916,2.192,14.898,6.17l1.432,1.432l3.906-3.906l-1.432-1.432
        c-8.214-8.211-8.214-21.576-0.005-29.79l36.689-36.686c3.981-3.981,9.272-6.173,14.898-6.173s10.916,2.192,14.898,6.17
        l13.868,13.873C233.577,101.723,233.577,115.09,225.363,123.302z"/>
    <path class="link-path inactive-button"style="fill:#000000;"  d="M142.539,173.459l-7.093,7.093l-11.002-10.999l7.093-7.093l-1.432-1.432c-1.04-1.037-2.422-1.611-3.89-1.611
        c-1.471,0-2.853,0.573-3.893,1.611l-36.686,36.681c-2.145,2.147-2.145,5.638,0,7.783l13.87,13.873
        c2.083,2.083,5.708,2.08,7.786,0.003l36.681-36.686c2.148-2.147,2.148-5.641,0-7.789L142.539,173.459z"/>
    <path class="link-path inactive-button" d="M200.493,90.643c-1.04-1.04-2.425-1.613-3.896-1.613c-1.471,0-2.856,0.573-3.896,1.616l-36.686,36.684
        c-2.142,2.147-2.142,5.638,0.003,7.786l1.434,1.432l10.88-10.883l11.002,11.002l-10.88,10.883l1.434,1.434
        c2.083,2.077,5.703,2.08,7.786-0.003l36.684-36.681c2.145-2.147,2.145-5.638,0-7.786L200.493,90.643z"/>
</g>
</g>
</g>
                    </svg>`;
        element.innerHTML += svg;
    }

    
    static addRemoveNodeButton(element) {
        // https://www.svgrepo.com/svg/126738/link
        const svg = `
            <svg class="remove-node" transform="
        translate(-25, -30)" class="link-node" xmlns="http://www.w3.org/2000/svg">
                <g transform="

        scale(0.07)"
        s>
        <g>
	<g>
		<g>
			<path d="M112.782,205.804c10.644,7.166,23.449,11.355,37.218,11.355c36.837,0,66.808-29.971,66.808-66.808
				c0-13.769-4.189-26.574-11.355-37.218L112.782,205.804z"/>
			<path d="M150,83.542c-36.839,0-66.808,29.969-66.808,66.808c0,15.595,5.384,29.946,14.374,41.326l93.758-93.758
				C179.946,88.926,165.595,83.542,150,83.542z"/>
			<path d="M149.997,0C67.158,0,0.003,67.161,0.003,149.997S67.158,300,149.997,300s150-67.163,150-150.003S232.837,0,149.997,0z
				 M150,237.907c-48.28,0-87.557-39.28-87.557-87.557c0-48.28,39.277-87.557,87.557-87.557c48.277,0,87.557,39.277,87.557,87.557
				C237.557,198.627,198.277,237.907,150,237.907z"/>
		</g>
	</g>
</g>
                    </svg>`;
        element.innerHTML += svg;
    }

    
}