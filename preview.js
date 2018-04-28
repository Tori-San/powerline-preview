/*
 *   BEWARE: ARCANE BULLSHIT
 *
 *   the following two functions assume that the "level"
 *   or "sep" classes appear last in the className
 */

/* Set appropriate text and background color
 *
 * Example: <div class="level-foobar"> gets
 *          color: var(--lfoobar-fg) and
 *          background-color: var(--lfoobar-bg)
 */
function setLevelClassStyle() {
    $("[class*=level]").each(function() {
        let cls = this.className;
        cls = "l" + cls.slice(cls.indexOf("level") + 6);
        this.style.color = "var(--"+cls+"-fg)";
        this.style.backgroundColor = "var(--"+cls+"-bg)";
        this.style.borderStyle = "solid";
        this.style.borderWidth = "0px 5px 0px 5px";
        this.style.borderColor = "var(--"+cls+"-bg)";
    });
}

/* Draw seperators with appropriate weight, color and direction
 *
 * Example: <div class="sep-foo-bar"> is set to a forward facing
 *          seperator between levels foo and bar.
 *          If the background color of those levels is the same,
 *          it is also set to a soft seperator.
 */
function redrawSeperators() {
    $("[class*=sep]").each(function() {
        let cls = this.className;
        cls = cls.slice(cls.indexOf("sep") + 3);
        let reversed = cls.startsWith("r");
        cls = cls.split("-").slice(1);
        let left, right;
        if (reversed) {
            left = cls[1];
            right = cls[0];
        } else {
            left = cls[0];
            right = cls[1];
        }
        fg = "--l" + left + "-bg"; // bg intentional
        bg = "--l" + right + "-bg";

        let soft = ($("body").css(fg) === $("body").css(bg))
        this.innerText = String.fromCharCode(57520 + 2 * reversed + 1 * soft);
        if (soft) { fg = "--l" + left + "-fg"; }

        this.style.color = "var(" + fg + ")";
        this.style.backgroundColor = "var("  + bg + ")";

    });
}

setLevelClassStyle();
redrawSeperators();
