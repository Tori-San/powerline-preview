/*
 *   BEWARE: ARCANE BULLSHIT
 *
 *   the following two functions assume that the "level"
 *   or "sep" classes appear last in the className
 */

/* Set appropriate text color
 *
 * Example: <div class="term-foobar"> gets
 *          color: var(--t-foobar)
 */
function setTermClassStyle() {
    $("[class*=term]").each(function() {
        let cls = this.className;
        cls = "t-" + cls.slice(cls.indexOf("term") + 5);
        this.style.color = "var(--"+cls+")";
        this.style.marginRight = "5px";
    });
}

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

var nameMap = {
    "--l1-fg": "level1_fg",
    "--l1-bg": "level1_bg",
    "--l1a-fg": "level1_fg_alt",
    "--l1a-bg": "level1_bg_alt",
    "--l1v-fg": "level1_fg_vis",
    "--l1v-bg": "level1_bg_vis",
    "--l1r-fg": "level1_fg_rep",
    "--l1r-bg": "level1_bg_rep",
    "--l2-fg": "level2_fg",
    "--l2-bg": "level2_bg",
    "--l2a-fg": "level2_fg_alt",
    "--l2a-bg": "level2_bg_alt",
    "--l3-fg": "level3_fg",
    "--l3-bg": "level3_bg",
    "--l3a-fg": "level3_fg_alt",
    "--l3a-bg": "level3_bg_alt",
    "--l4-fg": "level4_fg",
    "--l4-bg": "level4_bg",
    "--l4a-fg": "level4_fg_alt",
    "--l4a-bg": "level4_bg_alt",
    "--t-background": "background",
    "--t-foreground": "foreground",
    "--t-black": "black",
    "--t-altblack": "alt_black",
    "--t-red": "red",
    "--t-altred": "alt_red",
    "--t-green": "green",
    "--t-altgreen": "alt_green",
    "--t-yellow": "yellow",
    "--t-altyellow": "alt_yellow",
    "--t-blue": "blue",
    "--t-altblue": "alt_blue",
    "--t-magenta": "magenta",
    "--t-altmagenta": "alt_magenta",
    "--t-cyan": "cyan",
    "--t-altcyan": "alt_cyan",
    "--t-white": "white",
    "--t-altwhite": "alt_white",
}

/* Update stuff that is not automatically updated by css variables */
function updatePreview() {
    redrawSeperators();
    s = "";
    for (let k in nameMap) {
        s += nameMap[k] + ": \"" + chroma($("body").css(k)).hex() + "\"\n";
    }
    $("#output").html(s);
    $("#output-file").attr("href", "data:text/plain;charset=utf-8," + encodeURIComponent(s));
}

$("#output-clipboard").click(function() {
    $("#output").show();
    $("#output").select();
    document.execCommand("copy");
    $("#output").hide();
});

/* Make buttons apply or get the currently selected color */
$("[id^=button]").click(function() {
    let cls = this.id;
    cls = "--" + cls.slice(cls.indexOf("button") + 7);
    $("body").css(cls, $("#col-picked").css("--current"));
    updatePreview();
});
$("[id^=get]").click(function() {
    let cls = this.id
    cls = "--" + cls.slice(cls.indexOf("get") + 4);
    updateColorOptions(chroma($("body").css(cls)));
});

/* Automatically set alt term colors based on normal term colors */
$("#term-auto-alt").click(function() {
    for (s of ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"]) {
        $("body").css("--t-alt" + s, chroma($("body").css("--t-" + s)).brighten(1).css());
    }
});

/* Draw uploaded image onto the canvas */
function imgUploadHandler(e) {
    var reader = new FileReader();
    var f = e.target.files.item(0);

    reader.onload = function(e) {
        $("#canvas-placeholder").hide();
        var canvas = $("#cs");
        canvas.show();
        var img = new Image();
        img.setAttribute("src", e.target.result);
        img.addEventListener("load", function() {
            canvas[0].getContext("2d").drawImage(
                img, 0, 0, img.width, img.height,
                0, 0, canvas[0].width, canvas[0].height
            );
        });
    }

    reader.readAsDataURL(f);
}

$("#img-upload").change(imgUploadHandler);

$("#canvas-placeholder-text").click(function() {
    $("#img-upload").click();
});

/* Update color palette in the right column */
function updateColorOptions(picked) {
    $("#col-picked").css("--current", picked.css());
    $("[id^=col-]").each(function() {
        let [_, op, arg] = this.id.split("-")
        if (picked[op] && arg) {
            $(this).css("--current", picked[op](arg).css());
        }
    });
    $("#col-analogous-1").css("--current", picked.set("hsl.h", "-30").css());
    $("#col-analogous-2").css("--current", picked.set("hsl.h", "+0").css());
    $("#col-analogous-3").css("--current", picked.set("hsl.h", "+30").css());

    $("#col-splitcomp-1").css("--current", picked.set("hsl.h", "+150").css());
    $("#col-splitcomp-2").css("--current", picked.set("hsl.h", "+0").css());
    $("#col-splitcomp-3").css("--current", picked.set("hsl.h", "+210").css());

    $("#col-triadic-1").css("--current", picked.set("hsl.h", "-120").css());
    $("#col-triadic-2").css("--current", picked.set("hsl.h", "+0").css());
    $("#col-triadic-3").css("--current", picked.set("hsl.h", "+120").css());

    $("#col-tetradic-1").css("--current", picked.set("hsl.h", "-60").css());
    $("#col-tetradic-2").css("--current", picked.set("hsl.h", "+0").css());
    $("#col-tetradic-3").css("--current", picked.set("hsl.h", "+120").css());
    $("#col-tetradic-4").css("--current", picked.set("hsl.h", "+180").css());
}

$("[id^=col-]").click(function() {
    updateColorOptions(chroma($(this).css("--current")));
});

/* Color selection */
$("#cs").click(function(e) {
    let offset = $(this).offset()
    let rgba = this.getContext('2d')
        .getImageData(e.pageX - offset.left, e.pageY - offset.top, 1, 1)
        .data;
    updateColorOptions(chroma.rgb(rgba));
});

/* Initialize page:
 *
 * Assign levels and update seperators
 */
setLevelClassStyle();
setTermClassStyle();
updatePreview();
updateColorOptions(chroma($("body").css("--l1-bg")));
