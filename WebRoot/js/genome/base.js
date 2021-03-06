var bb, cc;
var horcrux={};
var washUver='39.3.4';
var washUtag='\
<span style="color:#3a81ba;">W<span style="font-size:80%;">ASH</span>U</span> \
<span style="color:#ff9900;">E<span style="font-size:80%;">PI</span></span>\
<span style="color:#38761d;">G<span style="font-size:80%;">ENOME</span></span> \
<span style="color:#cc4125;">B<span style="font-size:80%;">ROWSER</span></span>';


var gflag = {
allow_packhide_tkdata:false,
browser:undefined,
minichrjumping:false,
hasgene:true, // TODO move to genome
allowjuxtaposition:true,
cpmove:{dom:null,oldx:0,oldy:0},
movebbj:null,
mcmtermmove:{},
headerMove:{inuse:false}, // press on tk header and move vertically
arrowpan:{}, // animated panning by clicking arrow
/* for custom track to be submitted, key is url, not name
because during urlparam parsing, genome is not there so name can't be made
*/
// for categorical track configuration
cateTk:{which:-1,
	itemidx:null, // category idx
	item:null, // the color blob for the itemidx in config panel
	}, 
// querying sam read info when clicking on a sam track
samread:{},
// moving terms horizontally in mcm metadata colormap
zoomin:{}, // for zoom in
zoomout:{}, // for zoom out
animate_zoom:{},
mdlst:[],
mdp:{}, // invoking metadata vocabular panel
gsm:{},
tsp:{invoke:{type:-1},}, // invoking track selection panel, for purpose of submission
/* type -1: not applicable
1 native, clicking cell in big grid or sub-table
2 native, clicking cell in the single criterion tree
3 native, clicking "select all" option when mouse over a term in the big grid
4 native, keyword search
5 custom, clicking a cell in custom track grid

** gflag.tsp cannot be merged to apps.hmtk.type **
*/
menu:{ // context menu
	catetk:{}, // categorical track
	tklst:[],
	},
ctmae:{}, // custom track md anno editing
splinter:null, // set to not null for splintering
splinter_todolst:[], // fill content to indicate splinters come from restoring session or urlparam
// use bbj object for syncing (pan,zoom,jump)
syncviewrange:null,
shakedom:null,
is_cors:false,
cors_host:'',
__pageMakeDom_called:false,
dspstat_showgenomename:false,
bbj_x_updating:{},
dump:[],
badjson:[],
applst:[],
};

var maxHeight_menu='1600px';
var literal_imd='internalmd';
var literal_imd_genome='Genome';
var literal_sample='Sample';
var literal_assay='Assay';
var literal_no_term='no';
var literal_snpurl='http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=';
var literal_facet_nouse='&nbsp;&nbsp;&nbsp;';

var densitydecorpaddingtop = 3; // density decor track padding top...
var tkAttrColumnWidth = 18;
var regionSpacing = {width:1,color:'#ccc'};
var thinStackHeight = 2;
var fullStackHeight = 11;
var instack_padding = 2;
var instack_arrowwidth = 3;
var instack_arrowspacing = 5;

var weavertkalnh=10;
var weavertkpad=5;
var weavertkseqh=fullStackHeight;
var weavertk_hspdist_strpad=5;
var weavertk_hspdist_strh=10;
var weavertkstackheight=weavertkseqh*2+weavertkalnh+1;
var weavertkcolor_target='#004D99';
var weavertkcolor_query='#99004D';
var gs_size_limit=1000; // max size of gene set
var rungsv_size_limit=200; // max size to run gsv
var trackitemnumAlert=5000;

var svgt_no=-1,
	svgt_rect_notscrollable=1, // not subject to move.styleLeft
	svgt_rect=8,
	svgt_circle=2,
	svgt_line=3,
	svgt_line_notscrollable=7,
	svgt_path=4,
	svgt_text=5,
	svgt_text_notscrollable=6,
	svgt_arc=9,
	svgt_trihm=10,
	svgt_polygon=11;
var min_hmspan=700;
var max_initial_qtkheight=50;
var max_viewable_chrcount=200;

var FT_nottk=-1,
FT_bed_n=0,
FT_bed_c=1,
FT_bedgraph_n=2,
FT_bedgraph_c=3,
FT_sam_n=4,
FT_sam_c=5,
FT_pwc=6,
FT_htest=7,
FT_qdecor_n=8, // not in use
FT_lr_n=9,
FT_lr_c=10,
FT_tkgrp=11,
FT_cat_n=12, // categorical hmtk
FT_cat_c=13,
FT_bigwighmtk_n=14,
FT_bigwighmtk_c=15,
FT_matplot=16,
FT_bam_n=17,
FT_bam_c=18,
FT_gs=19, // gene set, in bev
FT_catmat=20,
FT_weaver_c=21,
FT_cm_c=22, // cytosin methylation
FT_ld_c=23,
FT_ld_n=26,
FT_anno_n=24,
FT_anno_c=25,
FT_qcats=27,
FT_huburl=100;
var FT2native=[];
FT2native[FT_bed_n]='bed';
FT2native[FT_bedgraph_n]='bedgraph';
FT2native[FT_bigwighmtk_n]='bigwig';
FT2native[FT_bam_n]='bam';
FT2native[FT_anno_n]='annotation';
FT2native[FT_ld_n]='ld';
var FT2noteurl={md:'http://wiki.wubrowse.org/Metadata'};
FT2noteurl[FT_weaver_c]='http://wiki.wubrowse.org/Genome_alignment';
FT2noteurl[FT_cm_c]='http://wiki.wubrowse.org/MethylC_track';
FT2noteurl[FT_matplot]='http://wiki.wubrowse.org/Matplot';
FT2noteurl[FT_huburl]='http://wiki.wubrowse.org/Datahub';
FT2noteurl[FT_anno_c]=FT2noteurl[FT_anno_n]='http://wiki.wubrowse.org/Hammock';
FT2noteurl[FT_catmat]='http://wiki.wubrowse.org/CategoricalMatrix';
FT2noteurl[FT_qcats]='http://wiki.wubrowse.org/QuantitativeCategorySeries';

var ftfilter_ordinary={}, ftfilter_numerical={};
// this converts ft to hub tk type
var FT2verbal = ['bed', 'bed', 'bedgraph', 'bedgraph', 'sam', 'sam', 'pwc', 'htest',
'bigwig', 'interaction','interaction',
'track group mysql table',
'categorical', 'categorical',
'bigwig', 'bigwig',
'matplot',
'bam', 'bam',
'bev gs',
'categorymatrix',
'genomealign',
'methylc',
'ld',
'hammock','hammock',
'ld',
'quantitativecategoryseries',
];

var M_hide=0,
	M_show=1,
	M_thin=2,
	M_full=3,
	M_arc=4,
	M_trihm=5,
	M_den=6,
	M_bar=7,
	M_invalid=-1;
var mode2str=['hide', 'show', 'thin', 'full', 'arc', 'heatmap', 'density','barplot'];
var W_fine=1,
	W_rough=2;
var W_togglethreshold=10;

var month2str=[null,'January','February','March','April','May','June','July','August','September','October','November','December'];
var month2sstr=[null,'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];


var RM_genome=0,
	RM_jux_n=1, // juxtaposing over native bed
	RM_jux_c=2, // custom bed
	RM_gsv_c=3, // gene set, soft!
	RM_gsv_kegg=4, // not in use
	RM_rpbr_beam=5, // similar as gsv_c but rpbr only
	RM_yearmonthday=6, // time data, day as units, juxtapose using a bed track encoding the calenda
	RM_protein=7; // protein view
var RM2verbal=['genome',
'juxtaposition',
'juxtaposition',
'gene set view',
'KEGG pathway',
'dark matter',
'temporal data'];


var ideoHeight = 14, // for plotting ideogram
cbarHeight = 9,
browser_scalebar_height=27;


var MAXbpwidth=6;
var MAXbpwidth_bold=10;

var gsselect = {which:0}; // gene struct selection stuff

var colorCentral = {
// the longlst can be altered by user, a copy will be made for default setting
longlst:["rgb(255,255,0)",
"rgb(255,153,0)","rgb(51,102,255)","rgb(255,102,255)","rgb(220,41,94)",
"rgb(51,102,0)","rgb(0,153,255)","rgb(255,153,255)","rgb(0,204,0)",
"rgb(255,102,0)","rgb(0,51,255)","rgb(255,51,255)","rgb(255,204,0)",
"rgb(255,0,0)","rgb(0,204,255)","rgb(255,204,255)","rgb(51,255,0)",
"rgb(51,153,153)","rgb(153,0,102)","rgb(153,204,51)","rgb(204,102,102)",
"rgb(143,143,255)","rgb(82,82,255)","rgb(255,82,171)","rgb(214,0,111)",
"rgb(162,82,255)","rgb(134,20,255)","rgb(214,104,0)","rgb(0,11,214)",
"rgb(102,51,51)","rgb(176,99,176)","rgb(102,51,102)","rgb(184,46,0)",
"rgb(245,61,0)","rgb(184,138,0)","rgb(0,138,184)","rgb(100,61,255)",
"rgb(153,0,0)","rgb(153,77,0)","rgb(214,107,0)","rgb(153,153,0)"
],
foreground:'#000000',
fg_r:0, fg_g:0, fg_b:0,
foregroundDim:'#ccc',
background:'#ffffff',
bg_faint:'rgba(100,100,100,.1)',
//pagebg:'rgba(217,217,206,0.7)',
pagebg:'#f1ede8',
iconbackground: "#AA839C", // light purple, manual button bg color
iconfill:'#956584',
tkentryfill:'rgba(204,204,255,0.5)',
magenta7:'rgba(153,51,153,0.7)',
magenta5:'rgba(153,51,153,0.5)',
magenta2:'rgba(153,51,153,0.2)',
magenta1:'rgba(153,51,153,0.1)',
};
var gapfillcolor=colorCentral.background;

// cytoband, monotonic color
var cytoBandColor = [
	255, // gneg
	180, // gpos25
	120, // gpos50
	60, // gpos75
	0, // gpos100
	0, // gvar
	180, // stalk
	142, // gpos33
	57 // gpos66
	];
var cytoWordColor = [0,0,255,255,255,255,0,255,255];
var centromereColor = "rgb(141,64,52)";
var ntbcolor = {g:'#3899c7', c:'#e05144', t:'#9238c7', a:'#89c738', n:'#858585'};

/* qtc  constant */
var scale_auto=0,
	scale_fix=1,
	scale_percentile=2,
	log_no=1,
	log_2=2,
	log_e=3,
	log_10=4,
	summeth_mean=1,
	summeth_max=2,
	summeth_min=3,
	summeth_sum=4;

/* default quantitative track style, will be copied over to their instances
   note height is for **plot height** not including top/bottom padding!
 */
var defaultQtcStyle = {
	heatmap:{pr:255,pg:0,pb:0,nr:0,ng:0,nb:230,pth:'#800000',nth:'#000099', thtype:scale_auto,thmin:0,thmax:10,thpercentile:90,height:15,summeth:summeth_mean},
	ft3:{pr:0,pg:0,pb:230,nr:255,ng:0,nb:0,pth:'#000099',nth:'#800000', thtype:scale_auto,thmin:0,thmax:10,thpercentile:90,height:15,summeth:summeth_mean},
	ft8:{pr:115,pg:0,pb:230,nr:179,ng:0,nb:179,pth:'#400080',nth:'#4d004d', thtype:scale_auto,thmin:0,thmax:10,thpercentile:95,height:50,summeth:summeth_mean},
	anno:{ textcolor:'#000000',
		fontsize:'8pt',
		fontfamily:'sans-serif',
		fontbold:false,
		bedcolor:'#336666'
	},
	ft5:{ textcolor:'#000000',
		fontsize:'8pt',
		fontfamily:'sans-serif',
		fontbold:false,
		forwardcolor:'rgb(0,0,153)',
		reversecolor:'rgb(153,0,0)',
		mismatchcolor:'rgb(255,255,0)',
	},
	interaction:{ textcolor:'#000000',
		thtype:scale_auto,
		fontsize:'8pt',
		fontfamily:'sans-serif',
		fontbold:false,
		pr:184,pg:0,pb:138,
		nr:0,ng:99,nb:133,
		pcolorscore:10,
		ncolorscore:-10,
		pfilterscore:0,
		nfilterscore:0,
		height:50, // for density mode
		anglescale:1,
	},
	// categorical
	ft12:{height:15},
	ft13:{height:15},
	// bev tracks
	bev:{pr:115,pg:0,pb:230,nr:179,ng:0,nb:179,pth:'#4d0099',nth:'#4D004d', thtype:scale_auto,thmin:0,thmax:10,thpercentile:95,height:30,summeth:summeth_mean},
	density:{pr:0,pg:77,pb:0,nr:0,ng:0,nb:230,pth:'#800000',nth:'#000099', thtype:scale_auto,thmin:0,thmax:10,thpercentile:95,height:50,summeth:summeth_mean},
}

var urllenlimit = 4000; // url string length limit

var apps={};

var pica;
var menu;
var menu2;
var picasays;
var bubble;
var invisibleBlanket;
var indicator2;
var scalebarbeam;
var pagecloak;
var waitcloak;
var glasspane;
var smear1,smear2;
var alertbox;
var msgconsole=undefined;


function Browser()
{
var s=[];
var i=0;
while(i<10) {
	var j=48+parseInt(75*Math.random());
	if(j<=57) {
		s.push(j); i++;
	} else if(j>=65 && j<=90) {
		s.push(j); i++;
	} else if(j>=97) {
		s.push(j); i++;
	}
	if(i==10) break;
}
var s2=[];
for(var i=0; i<10; i++) s2.push(String.fromCharCode(s[i]));
this.sessionId=s2.join('');

this.statusId=1;
this.urloffset=0;
this.highlight_regions=[];

this.horcrux=Math.random().toString();
horcrux[this.horcrux]=this;

this.hmSpan=1;
this.regionLst=[];
this.border = {lname:'', lpos:0, rname:'', rpos:0};

this.tklst=[];

/* doms */
this.scalebar={};

// md terms on rows/columns of track selection grid
this.mcm={lst:[], // sequence of terms in colormap, ele: [term, mdidx]
	sortidx:0,
	holder:null, // holder of vertical term names, .attop tells header position
	tkholder:null, // holder of mcm canvas for tracks in ghm
	manuallysorted:false,
	};

this.move={
	direction:null, // l/r, null for indicating not moving
	merge:false, // if new data should be merged with old data for the same region
	offsetShift:0, // use when merge is true, only for stack decor
	styleLeft:0, // .style.left for movables
	oldpos:0,
	moved:false,
	mousex:0};
this.entire={length:0, 
	spnum:0, 
	summarySize:0, 
	atbplevel:false,
	bpwidth:0};
this.dspBoundary={};
// critical paramter juxtaposition, set to null to indicate non-functional browser, e.g. golden pillar
this.juxtaposition={};
this.ideogram = {
	canvas:null,
	band:[], 
	chr:null, 
	minihash:{},
	minirulerhash:{},
	longhash:{},
	minicanvaswidth:0,
	minicanvasheight:14,
	minirulerheight:15,
	previous:[],
	cross:{sf:0,lenlst:[],namelst:[],}
	};
this.navigator={canvas:null,
	chrbarheight:14,
	rulerheight:20, // set to 0 for not drawing, including spacing
	hlspacing:2,
	};
this.correlation = {targetft:-1, // target track file type, universal
	where:0, // in case of bigwig, it need to know whether is 0 heatmap or 1 decor it belongs to
	targetname:'', // target track name
	rawdata:[],
	rankeddata:[],
	qtc:{pr:255,pg:50,pb:50,nr:50,ng:50,nb:255,pth:'#800000',nth:'#000099'},
	inuse:false,
	holder:null
	};
this.htest = {pvalue:[],
	inuse:false,
	grpnum:0,
	// only pcolor, ncolor are effective
	qtc:{pr:255,pg:77,pb:77,
	nr:255,ng:77,nb:77,
	pth:'#b30000',nth:'#b30000',thtype:0,logtype:log_10,height:50}, };
/* pairwise comparison central object */
this.pwc = {
	inuse:false, 
	qtc:{pr:230,pg:0,pb:0, nr:0,ng:204,nb:0,
	pth:'#800000',nth:'#008000',
	thtype:0,thmin:-3,thmax:3,thpercentile:95,
	logtype:log_no,
	height:50},
	gtn1:[], gtn2:[],
	};

this.notes=[];

// a list of splinters
this.splinters={};
this.trunk=null;
this.splinterTag=null; // set to null to tell this is not a splinter

this.animate_zoom_stat=0;
/* 0 for not zooming, or data ready for rendering
1 for doing animated zooming, or ajax data not ready yet
*/

this.tkgroup=[];
/* group id 1,2,3 as array index
ele: {scale, max, min, max_show, min_show}
*/
this.weaver=null;
this.__hubmdvlookup={};
this.__hubfailedmdvurl={};
return this;
}




/*** __dom__ ***/
function dom_create(tag,holder,style,p)
{
var d=document.createElement(tag);
if(holder) {
	holder.appendChild(d);
} else {
	document.body.appendChild(d);
}
if(style) {
	d.setAttribute('style',style);
}
if(p) {
	if(p.c) d.className=p.c;
	if(p.t) d.innerHTML=p.t;
	if(p.clc) d.onclick=p.clc;
	if(p.title) d.title=p.title;
}
return d;
}

function make_radiobutton(holder,pp)
{
var ip=dom_create('input',holder);
ip.type='radio';
ip.setAttribute('name',pp.name);
ip.setAttribute('id',pp.id);
ip.setAttribute('value',pp.value);
ip.addEventListener('change',pp.call,false);
var lb=dom_create('label',holder);
lb.style.marginLeft=5;
lb.innerHTML=pp.label;
lb.setAttribute('for',pp.id);
if(pp.linebreak) {
	dom_create('br',holder);
}
return ip;
}
function dom_addbutt(holder,text,call,style)
{
var b=dom_create('button',holder,style);
b.type='button';
b.innerHTML=text;
if(call) {
	b.addEventListener('click',call,false);
}
return b;
}

function dom_addtext(holder,text,color,cls)
{
var s=dom_create('span',holder);
if(text)
	s.innerHTML=text;
if(color)
	s.style.color=color;
if(cls)
	s.className=cls;
return s;
}
function make_headertable(holder)
{
var t=dom_create('div',holder,'display:table;background-color:'+colorCentral.background_faint_7+';border-top:solid 1px '+colorCentral.magenta7);
t._h=dom_create('div',t,'text-align:center;margin:8px 20px;padding:5px 0px 10px;border-bottom:solid 1px '+colorCentral.magenta2);
t._c=dom_create('div',t,'padding:20px;');
return t;
}

function make_slidingtable(param)
{
var d=dom_create('div',param.holder,'overflow:hidden;padding:5px;');
var table=dom_create('table',d);
table.cellPadding=table.cellSpacing=0;
var tr=table.insertRow(0);
// 1-1
var td=tr.insertCell(0);
d.leadingcell=td;
// 1-2
td=tr.insertCell(1);
var d2=dom_create('div',td,'position:relative;overflow:hidden;width:'+param.hscroll.width+'px;height:'+param.hscroll.height+'px;');
var d3=dom_create('div',d2,'position:absolute;left:0px;top:0px;');
d.hscroll=d3;
tr=table.insertRow(1);
// 2-1
td=tr.insertCell(0);
d2=dom_create('div',td,'position:relative;overflow:hidden;width:'+param.vscroll.width+'px;height:'+param.vscroll.height+'px;');
d3=dom_create('div',d2,'position:absolute;left:0px;top:0px;');
d.vscroll=d3;
// 2-2
td=tr.insertCell(1);
d2=dom_create('div',td,'position:relative;overflow:hidden;width:'+param.hscroll.width+'px;height:'+param.vscroll.height+'px;');
d2.addEventListener('mousedown',slidingtableMD,false);
d2.slidingtable=d;
d3=dom_create('div',d2,'position:absolute;left:0px;top:0px;');
d.scroll=d3;
return d;
}

function slidingtableMD(event)
{
/* generic moving panel */
if(event.button != 0) return;
var d= event.target;
while(!d.slidingtable) {d=d.parentNode;}
event.preventDefault();
gflag.slidingtable={d:d.slidingtable,oldx:event.clientX,oldy:event.clientY};
document.body.addEventListener('mousemove', slidingtableMM, false);
document.body.addEventListener('mouseup', slidingtableMU, false);
}
function slidingtableMM(event)
{
var d = gflag.slidingtable.d;
d.hscroll.style.left = parseInt(d.hscroll.style.left) + event.clientX - gflag.slidingtable.oldx;
d.vscroll.style.top = parseInt(d.vscroll.style.top) + event.clientY - gflag.slidingtable.oldy;
d.scroll.style.left = parseInt(d.scroll.style.left) + event.clientX - gflag.slidingtable.oldx;
d.scroll.style.top = parseInt(d.scroll.style.top) + event.clientY - gflag.slidingtable.oldy;
gflag.slidingtable.oldx = event.clientX;
gflag.slidingtable.oldy = event.clientY;
/* to help with escaping click event on d
click callback on d will test gflag.slidingtable.d.moved
if true, set to false and quit
else, it is a real click
*/
d.moved=true;
}
function slidingtableMU(event)
{
event.preventDefault();
document.body.removeEventListener('mousemove', slidingtableMM, false);
document.body.removeEventListener('mouseup', slidingtableMU, false);
}





function make_tablist(param)
{
/* switching tabs, two layout (tabs on left, tabs on top)
tabtop: true if tabs on top row
tabpadding:
*/
var table=document.createElement('table');
table.style.margin='0px 10px 10px 10px';
table.cellPadding=table.cellSpacing=0;
var tr=table.insertRow(0);
// tabs
var td=tr.insertCell(0);
table.tab_td=td; // for bgcolor
if(param.tabtop) {
	td.vAlign='bottom';
} else {
	td.vAlign='top';
}
// tab holder
var d=dom_create('div',td, param.tabtop?'margin:10px 10px 0px 10px;display:inline-block':'margin: 10px 0px 10px 10px;');
if(param.tabholderborder) {
	d.style.border='1px solid '+colorCentral.foreground_faint_1;
	if(param.tabtop) {
		d.style.borderBottomWidth=0;
	} else {
		d.style.borderRightWidth=0;
	}
}
table.tab_holder=d; // for bgcolor
var firsttab=null;
var tabs=[];
for(var i=0; i<param.lst.length; i++) {
	var tab=dom_create('div',d);
	tabs.push(tab);
	if(param.tabpadding) {
		tab.style.padding=param.tabpadding;
	}
	if(param.tabtop) {
		tab.style.display='inline-block';
	}
	tab.className='tablisttab_off';
	if(param.tabtop) {
		tab.style.padding='5px 15px';
		tab.style.borderBottom='solid 1px '+colorCentral.background_faint_1;
	} else {
		tab.style.borderRight='solid 1px '+colorCentral.background_faint_1;
	}
	tab.innerHTML=param.lst[i];
	tab.addEventListener('click',tablisttab_click,false);
	tab.table=table;
	tab.tablist_idx=i;
	if(i==0) firsttab=tab;
}
table.tabs=tabs;
// list of holders
if(param.tabtop) {
	tr=table.insertRow(1);
	td=tr.insertCell(0);
	td.style.borderTop='solid 1px '+colorCentral.magenta7;
} else {
	td=tr.insertCell(1);
	td.vAlign='top';
	td.style.borderLeft='solid 1px '+colorCentral.magenta7;
}
table.page_td=td; // for bgcolor
td.style.padding=10;
td.style.whiteSpace='nowrap';
var holders=[];
for(var i=0; i<param.lst.length; i++) {
	holders.push(dom_create(param.usediv?'div':'table',td));
}
simulateEvent(firsttab,'click');
table.holders=holders;
return table;
}

function tablisttab_click(event)
{
// clicking on a tab (div)
var lst=event.target.table.tabs;
var lst2=event.target.table.page_td.childNodes;
for(var i=0; i<lst.length; i++) {
	lst[i].className='tablisttab_off';
	lst2[i].style.display='none';
}
event.target.className='tablisttab_on';
lst2[event.target.tablist_idx].style.display='block';
}







function dom_inputtext(holder,p)
{
var i=dom_create('input',holder);
i.type='text';
i.size=p.size?p.size:10;
if(p.ph) {
	i.placeholder=p.ph;
}
if(p.call) {
	i.addEventListener('keyup',p.call,false);
}
return i;
}
function dom_inputnumber(holder,p)
{
var i=dom_create('input',holder);
i.type='number';
i.style.width=p.width?p.width:50;
i.value=p.value;
if(p.call) {
	i.addEventListener('keyup',p.call,false);
}
return i;
}
function dom_addcheckbox(holder,label,call)
{
var t=dom_create('input',holder,'margin-right:8px;');
t.type='checkbox';
var id=Math.random().toString();
t.id=id;
if(call) {
	t.addEventListener('change',call,false);
}
var l=dom_create('label',holder);
l.innerHTML=label;
l.setAttribute('for',id);
return t;
}

function dom_addselect(holder,call,options)
{
var s=dom_create('select',holder);
if(call) {
	s.addEventListener('change',call,false);
}
for(var i=0; i<options.length; i++) {
	var o=dom_create('option',s);
	o.value=options[i].value;
	o.text=options[i].text;
	if(options[i].selected) {
		o.selected=true;
	}
}
return s;
}

function dom_addrowbutt(holder,lst,style,rowbgcolor)
{
var d=dom_create('table',holder,style);
d.className='butt_holder';
d.cellSpacing=0;
var tr=d.insertRow(0);
if(rowbgcolor) {
	tr.style.backgroundColor=rowbgcolor;
}
for(var i=0; i<lst.length; i++) {
	var c=lst[i];
	var td=tr.insertCell(-1);
	td.className='button';
	td.innerHTML=(c.pad?'&nbsp;':'')+c.text+(c.pad?'&nbsp;':'');
	td.addEventListener('click',c.call,false);
	if(c.attr) {
		for(var k in c.attr) {
			td[k]=c.attr[k];
		}
	}
}
return d;
}

function dom_labelbox(p)
{
var d=dom_create('table',p.holder,'cursor:default;'+(p.style?p.style:''));
d.className='labelbox';
d.cellSpacing=0;
if(p.call) {
	d.onclick=p.call;
	d.onmouseover=labelbox_mover;
	d.onmouseout=labelbox_mout;
}
var tr=d.insertRow(0);
var td=tr.insertCell(0);
td.style.padding='';
td.style.fontSize='70%';
td.style.opacity=.7;
d.stext=td;
if(p.stext) {
	td.innerHTML=p.stext;
}
tr=d.insertRow(1);
td=tr.insertCell(0);
if(!p.color) {
	p.color='#858585';
}
d.color=p.color;
td.style.borderTop='2px solid '+p.color;
td.style.padding='4px 10px';
td.style.backgroundColor=lightencolor(colorstr2int(p.color),.7);
d.ltext=td;
if(p.ltext) {
	td.innerHTML=p.ltext;
}
return d;
}

function labelbox_mover(event)
{
var d=event.target;
while(d.className!='labelbox') d=d.parentNode;
d.firstChild.childNodes[1].firstChild.style.borderColor=darkencolor(colorstr2int(d.color),.4);
}
function labelbox_mout(event)
{
var d=event.target;
while(d.className!='labelbox') d=d.parentNode;
d.firstChild.childNodes[1].firstChild.style.borderColor=d.color;
}


function dom_bignumtable(holder,num1,num2,style)
{
var table=dom_create('table',holder,style);
var tr=table.insertRow(0);
var td=tr.insertCell(0);
table.num1=td;
td.vAlign='top';
td.style.fontSize='150%';
td.style.fontWeight='bold';
td.className='headcount';
td.innerHTML=num1;
td=tr.insertCell(-1);
td.vAlign='top';
td.style.fontSize='70%';
td.style.opacity=.7;
td.innerHTML='TOTAL / ';
td=tr.insertCell(-1);
td.vAlign='top';
td.style.fontWeight='bold';
td.className='headcount';
table.num2=td;
td.innerHTML=num2;
td=tr.insertCell(-1);
td.vAlign='top';
td.style.fontSize='70%';
td.style.opacity=.7;
td.innerHTML='SHOWN';
return table;
}

/*** __dom__ ends ***/





var genome={}; // key: genome name (dbName), val: Genome object

function Genome(param)
{
// page components must be ready
this.init_genome_param=param; // need to keep it, some components will only be made after loading genome data
this.hmtk={};
this.pending_custtkhash={};
this.temporal_ymd=null; // temporal data, at day-precision

this.mdselect={};
var d=document.createElement('div');
this.mdselect.main=d;
if(param.custom_track) {
	this.custtk={
		names:[],
	};

	// submission ui
	var d=document.createElement('div'); // overal wrapper
	d.style.position='relative';
	this.custtk.main=d;
	// launch buttons
	var d2=dom_create('div',d,'display:block;position:absolute;left:0px;top:0px;width:800px;');
	dom_create('div',d2,'margin:15px 0px;color:white;').innerHTML='Tracks need to be hosted on a web server that is accessible by this browser server.';
	this.custtk.buttdiv=d2;
	var d3=dom_create('div',d2);
	d3.className='largebutt';
	d3.addEventListener('click',function(){custtkpanel_show(FT_bedgraph_c);},false);
	d3.innerHTML='bedGraph<div style="color:inherit;font-weight:normal;font-size:70%;">quantitative data</div>';

	d3=dom_create('div',d2);
	d3.className='largebutt';
	d3.addEventListener('click',function(){custtkpanel_show(FT_bigwighmtk_c);},false);
	d3.innerHTML='bigWig';

	d3=dom_create('div',d2);
	d3.className='largebutt';
	d3.addEventListener('click',function(){custtkpanel_show(FT_cat_c);},false);
	d3.innerHTML='Categorical';

	dom_create('br',d2);

	d3=dom_create('div',d2);
	d3.className='largebutt';
	d3.addEventListener('click',function(){custtkpanel_show(FT_anno_c);},false);
	d3.innerHTML='Hammock<div style="color:inherit;font-weight:normal;font-size:70%;">annotation data</div>';
	d3=dom_create('div',d2);
	d3.className='largebutt';
	d3.addEventListener('click',function(){custtkpanel_show(FT_weaver_c);},false);
	d3.innerHTML='Genomealign<div style="color:inherit;font-weight:normal;font-size:70%;">Genome alignment</div>';

	d3=dom_create('div',d2);
	d3.className='largebutt';
	d3.addEventListener('click',function(){custtkpanel_show(FT_lr_c);},false);
	d3.innerHTML='Interaction<div style="color:inherit;font-weight:normal;font-size:70%;">pairwise interaction</div>';

	d3=dom_create('div',d2);
	d3.className='largebutt';
	d3.addEventListener('click',function(){custtkpanel_show(FT_bed_c);},false);
	d3.innerHTML='BED';

	d3=dom_create('div',d2);
	d3.className='largebutt';
	d3.addEventListener('click',function(){custtkpanel_show(FT_bam_c);},false);
	d3.innerHTML='BAM';
	dom_create('br',d2);
	d3=dom_create('div',d2,'color:rgb(81,118,96);');
	d3.className='largebutt';
	d3.addEventListener('click',function(){custtkpanel_show(FT_huburl);},false);
	var butt=dom_create('input',d2,'display:none');
	butt.type='file';
	butt.addEventListener('change',jsonhub_choosefile,false);
	d3.innerHTML='Datahub<div style="color:inherit;font-weight:normal;">by URL link</div>';
	d3=dom_create('div',d2,'color:rgb(81,118,96);');
	d3.className='largebutt';
	d3.addEventListener('click',jsonhub_upload,false);
	d3.innerHTML='Datahub<div style="color:inherit;font-weight:normal;">by upload</div>';
	dom_create('div',d2,'margin:15px 0px;color:white;').innerHTML='Got text files instead? <span class=clb3 onclick="toggle7_2();toggle27()">Upload them from your computer.</span>'+
	'<br><br>To submit <a href='+FT2noteurl[FT_cm_c]+' target=_blank>methylC</a> or <a href='+FT2noteurl[FT_matplot]+' target=_blank>matplot</a> track, use Datahub.';
	// submission ui
	d2=dom_create('div',d,'position:absolute;display:none;');
	this.custtk.ui_submit=d2;
	this.custtk.ui_bedgraph=this.custtk_makeui(FT_bedgraph_c,d2);
	this.custtk.ui_hammock=this.custtk_makeui(FT_anno_c,d2);
	this.custtk.ui_weaver=this.custtk_makeui(FT_weaver_c,d2);
	this.custtk.ui_bed=this.custtk_makeui(FT_bed_c,d2);
	this.custtk.ui_lr=this.custtk_makeui(FT_lr_c,d2);
	this.custtk.ui_bigwig=this.custtk_makeui(FT_bigwighmtk_c,d2);
	this.custtk.ui_cat=this.custtk_makeui(FT_cat_c,d2);
	this.custcate_idnum_change(5);
	this.custtk.ui_bam=this.custtk_makeui(FT_bam_c,d2);
	this.custtk.ui_hub=this.custtk_makeui(FT_huburl,d2);
}

this.scaffold={};
this.defaultStuff={};

/*** bird's eye view
track canvas's height will be .qtc.height, with no padding
but will have 4px top margin

"data" points to a hash of tracks
   key: track name
   value: {}
	'data': the data vector, addressed by chr name
	'tr': <tr> in bev_dataregistry
	'min', 'max': threshold values
	'minspan', 'maxspan': place to write threshold values in <tr>
	'canvas':{'chr1':<canvas>,...}
"ongoing" indicates the track that's been computed
    could be undefined, to indicate that all vectors are under focus...
"pressedChr" the chr name that is used for zoom in
'scfd' is a partial replicate of global object scaffold
***/
this.bev={};
return this;
}

Genome.prototype.jsonGenome=function(data)
{
/* establish genome components with json data
*/
this.name=data.dbname;
this.hasGene=data.hasGene;
this.noblastdb=data.noblastdb?true:false;

for(var i=0; i<gflag.mdlst.length; i++) {
	var v=gflag.mdlst[i];
	if(v.tag==literal_imd) {
		v.c2p[this.name]={};
		v.c2p[this.name][literal_imd_genome]=1;
		if(!(literal_imd_genome in v.p2c)) v.p2c[literal_imd_genome]={};
		v.p2c[literal_imd_genome][this.name]=1;
		stripChild(v.mainul,0);
		for(var rt in v.root) {
			make_mdtree_recursive(rt,v,i,v.mainul);
		}
		break;
	}
}


if(data.yearlyMonthlyLength) {
	this.temporal_ymd={};
	for(var i=0; i<data.yearlyMonthlyLength.length; i++) {
		var t=data.yearlyMonthlyLength[i];
		if(t[0] in this.temporal_ymd) {
			this.temporal_ymd[t[0]][t[1]]=t[2];
		} else {
			var a={};
			a[t[1]] = t[2];
			this.temporal_ymd[t[0]]=a;
		}
	}
}

this.defaultStuff={
	coord:data.defaultPosition,
	gsvlst:data.defaultGenelist,
	custtk:{},
	initmatplot:data.initmatplot,
	runmode:data.runmode,
	decor:[],
	};
if(data.defaultDecor) {
	this.defaultStuff.decor=data.defaultDecor.split(',');
}

if(this.custtk) {
	var v=data.defaultCustomtracks;
	if(v) {
		this.defaultStuff.custtk=v;
		if(!(FT_bam_c in v)) this.custtk.ui_bam.examplebutt.style.display='none';
		if(!(FT_bed_c in v)) this.custtk.ui_bed.examplebutt.style.display='none';
		if(!(FT_bedgraph_c in v)) this.custtk.ui_bedgraph.examplebutt.style.display='none';
		if(!(FT_bigwighmtk_c in v)) this.custtk.ui_bigwig.examplebutt.style.display='none';
		if(!(FT_cat_c in v)) this.custtk.ui_cat.examplebutt.style.display='none';
		if(!(FT_anno_c in v)) this.custtk.ui_hammock.examplebutt.style.display='none';
		if(!(FT_huburl in v)) this.custtk.ui_hub.examplebutt.style.display='none';
		if(!(FT_lr_c in v)) this.custtk.ui_lr.examplebutt.style.display='none';
		if(FT_weaver_c in v) {
			var g=this;
			for(var qn in v[FT_weaver_c]) {
				dom_create('div',
					this.custtk.ui_weaver.weavertkholder,
					'display:inline-block;margin:10px;',
					{t:qn,c:'clb',clc:weaver_custtk_example(g,qn,v[FT_weaver_c][qn])});
			}
		}
	}
}

if(data.keggSpeciesCode) {
	this.keggSpeciesCode=data.keggSpeciesCode;
}
if(this.init_genome_param.gsm) {
	this.make_gsm_ui();
}

/* some tracks are associated with specific regions
assume these tracks are all assay datasets
*/
if('track2Regions' in data) {
	for(var n in data.track2Regions) {
		var tk=this.hmtk[n];
		if(tk!=undefined) {
			var o=data.track2Regions[n];
			tk.regions=[o[0],o[1].split(',')];
		}
	}
}

this.decorInfo={};
if(data.decorJson) {
	for(var n in data.decorJson) {
		decorJson_parse(data.decorJson[n],this.decorInfo);
	}
}
this.searchgenetknames=[];
for(var tkn in this.decorInfo) {
	var tk=this.decorInfo[tkn];
	if(!tk.filetype) {
		print2console('filetype missing for track '+tkn,2);
		delete this.decorInfo[tkn];
		continue;
	}
	var n=tk.filetype.toLowerCase();
	tk.ft=FT2native.indexOf(n);
	if(tk.ft==-1) {
		tk.ft=FT2verbal.indexOf(n);
	}
	if(tk.ft==-1) {
		print2console('Wrong file type for '+tkn+': '+n,2);
		delete this.decorInfo[tkn];
		continue;
	}
	delete tk.filetype;

	parseHubtrack(tk);

	if(tk.ft==FT_weaver_c) {
		if(!tk.querygenome) {
			print2console('Missing querygenome for '+tkn,2);
			delete this.decorInfo[tkn];
			continue;
		}
		tk.cotton=tk.querygenome;
		delete tk.querygenome;
	}
	if(tk.categories) {
		tk.cateInfo=tk.categories;
		delete tk.categories;
	}
	if(tk.isgene && tk.dbsearch) {
		this.searchgenetknames.push(tk.name);
	}
}
this.tablist_decor=document.createElement('div');
this.tablist_decor.style.margin=10;
dom_maketree(data.decorJson,this.tablist_decor,decorTrackcell_make);

this.cytoband={};
if('cytoband' in data) {
	for(var i=0; i<data.cytoband.length; i++) {
		if(data.cytoband[i][0] in this.cytoband)
			this.cytoband[data.cytoband[i][0]].push(data.cytoband[i].slice(1,5));
		else
			this.cytoband[data.cytoband[i][0]] = [data.cytoband[i].slice(1,5)];
	}
}

/* scaffold
*/
this.scaffold={p2c:{}, c2p:{}, len:{}, current:[], toadd:[], move:{}};
for(var i=0; i<data.scaffoldInfo.length; i++) {
	var lst = data.scaffoldInfo[i];
	this.scaffold.c2p[lst[1]] = lst[0];
	if(!(lst[0] in this.scaffold.p2c)) {
		this.scaffold.p2c[lst[0]] = {};
	}
	this.scaffold.p2c[lst[0]][lst[1]] = 1;
	if(lst[2] > 0) {
		// child is sequence
		this.scaffold.len[lst[1]] = lst[2];
	}
}
this.scaffold.current=[];
var lst=data.defaultScaffold.split(',');
for(i=0; i<lst.length; i++) {
	if(lst[i].length>0) {
		if(lst[i] in this.scaffold.len) {
			this.scaffold.current.push(lst[i]);
		} else {
			print2console('Invalid scaffold sequence name: '+lst[i],2);
		}
	}
}
var t=document.createElement('table');
t.cellSpacing=0; t.cellPadding=2;
this.scaffold.overview={
	holder:t,
	maxw:800,
	trlst:[],
	pwidth:{},
	barheight:14,
};

/* linkage group
*/
if(data.linkagegroup) {
	var hash={};
	var order=[];
	var glen={}; // 'len' of each group: biggest genetic distance
	var s2g={}; // seq 2 group
	for(var i=0; i<data.linkagegroup.length; i++) {
		var t=data.linkagegroup[i];
		// seq, grp, dist, width, strand
		if(t[1] in hash) {
			hash[t[1]].push({n:t[0],d:t[2],w:t[3],s:t[4]});
			if(t[2]>glen[t[1]]) {
				glen[t[1]]=t[2];
			}
		} else {
			order.push(t[1]);
			glen[t[1]]=t[2];
			hash[t[1]]=[{n:t[0],d:t[2],w:t[3],s:t[4]}];
		}
		s2g[t[0]]=t[1];
	}
	this.linkagegroup={
		hash:hash,
		totalnum:data.linkagegroup.length,
		maxw:Math.max(800,document.body.clientWidth-400),
		order:order,
		len:glen,
		c_for:'rgb(0,102,0)',
		c_rev:'rgb(255,102,0)',
		c_un:'#a8a8a8',
		h_top:4,
		h_link:40,
		h_bottom:10,
		};
	this.scaffold.tolnkgrp=s2g;
}

// make scaffold panel after parsing linkage group
this.scfdoverview_makepanel();

/* public hubs */
this.publichub={holder:document.createElement('div'),lst:[]};
//this.publichub.holder.style.marginBottom=20;
this.publichub.holder.style.width=1200;
if(data.publichub && data.publichub.length>0) {
	for(var i=0; i<data.publichub.length; i++) {
		var hub=data.publichub[i];
		var childholder=this.publichub_makehandle(hub,this.publichub.holder);
		if(hub.hublist) {
			for(var j=0; j<hub.hublist.length; j++) {
				this.publichub_makehandle(hub.hublist[j],childholder);
			}
		}
	}
} else {
	this.publichub.holder.className='alertmsg';
	this.publichub.holder.style.color='white';
	this.publichub.holder.innerHTML='There are no public track hubs available for this genome.';
}


/* prepare bev panel, can't do this in Genome, requires scfd info
*/
if(apps.bev) {
	this.bev.main=document.createElement('div');
	var d=make_headertable(this.bev.main);
	d._h.style.textAlign='left';
	var t=dom_addrowbutt(d._h,[
		{text:'Add track',pad:true,call:bev_addtrack_invoketkselect},
		{text:'Add gene set',pad:true,call:bev_showgeneset},
		{text:'&#9881; Configure',pad:true,call:bev_config},
		{text:'Screenshot',pad:true,call:bev_svg}],
		'margin:0px 20px;',
		colorCentral.background_faint_5);
	this.bev.main.svgbutt=t.firstChild.firstChild.childNodes[3];
	this.bev.main.svgbutt.addEventListener('mousedown',bev_svgbutt_md,false);
	this.bev.main.svgsays=dom_addtext(d._h);
	var d2=dom_create('div',d._c,'height:600px;overflow-y:scroll;');
	this.bev.viewtable=dom_create('table',d2);
	this.bev.chrlst=[];
	var lst=this.scaffold.current;
	for(var i=0; i<lst.length; i++) {
		/* each ele:
		0. chr name
		1. canvas size, spnum
		2. ideogram <canvas>
		3. <td> to hold track canvas
		*/
		this.bev.chrlst.push([lst[i],0,null]);
	}
	this.bev.config={
		maxpxwidth:document.body.clientWidth-300,
		chrbarheight:14,
		chrbarminheight:6, // <= this number chrbar will be hidden
		};
	menu.c40.says.innerHTML=this.bev.config.maxpxwidth;
	this.bev.tklst=[];
	this.bev_prepare();
	this.bev_draw();
}
}



Genome.prototype.getcytoband4region2plot=function(chrom, start, stop, plotwidth)
{
/* given a query region, find cytoband data in it
for each band returns [name, plot length (pixel), coloridx, athead(bool), attail(bool)]
plotwidth: on screen width of this interval
 */
if(!(chrom in this.cytoband)) return chrom;
var sf=plotwidth/(stop-start);
var result = [];
var elen=this.scaffold.len[chrom];
for(var i=0; i<this.cytoband[chrom].length; i++) {
	var b = this.cytoband[chrom][i];
	if(Math.max(start, b[0]) < Math.min(stop, b[1])) {
		var thisstart = Math.max(start, b[0]);
		var thisstop = Math.min(stop, b[1]);
		result.push([b[3], (thisstop-thisstart)*sf, b[2], thisstart==0, thisstop==elen]);
	}
}
return result;
}

function drawIdeogramSegment_simple(data, ctx, x, y, plotwidth, plotheight, tosvg)
{
/* only draws data within a region
args:
data: getcytoband4region2plot() output
x/y: starting plot position on canvas, must be integer
plotwidth: entire plotting width, only used to draw the blank rectangle
 */
ctx.font = "bold 8pt Sans-serif";
var mintextheight=13;
if(typeof(data)=='string') {
	// no cytoband data
	var svgdata=[];
	ctx.strokeStyle = colorCentral.foreground;
	ctx.strokeRect(x,y+0.5,plotwidth,plotheight);
	if(tosvg) svgdata.push({type:svgt_rect,x:x,y:y+.5,w:plotwidth,h:plotheight,stroke:ctx.strokeStyle});
	ctx.fillStyle = colorCentral.foreground;
	var s=data; // is chrom name
	var w = ctx.measureText(s).width;
	if(w<=plotwidth && plotheight>=mintextheight) {
		var y2=y+10+(plotheight-mintextheight)/2;
		ctx.fillText(s, x+(plotwidth-w)/2, y2);
		if(tosvg) svgdata.push({type:svgt_text,x:x+(plotwidth-w)/2,y:y2,text:s,bold:true});
	}
	return svgdata;
}
var svgdata=[];
var previousIsCentromere = null;
for(var i=0; i<data.length; i++) {
	var band = data[i];
	if(band[2] >= 0) {
		ctx.fillStyle = 'rgb('+cytoBandColor[band[2]]+','+cytoBandColor[band[2]]+','+cytoBandColor[band[2]]+')';
		ctx.fillRect(x, y, band[1], plotheight);
		if(tosvg) svgdata.push({type:svgt_rect,x:x,y:y,w:band[1],h:plotheight,fill:ctx.fillStyle});
		ctx.strokeStyle = colorCentral.foreground;
		ctx.beginPath();
		ctx.moveTo(x,0.5+y);
		ctx.lineTo(x+band[1],0.5+y);
		ctx.moveTo(x,plotheight-0.5+y);
		ctx.lineTo(x+band[1],plotheight-0.5+y);
		ctx.stroke();
		if(tosvg) {
			svgdata.push({type:svgt_line,x1:x,y1:y+.5,x2:x+band[1],y2:y+.5});
			svgdata.push({type:svgt_line,x1:x,y1:plotheight-0.5+y,x2:x+band[1],y2:plotheight-0.5+y});
		}
		var w = ctx.measureText(band[0]).width;
		if(w < band[1] && plotheight>=mintextheight) {
			ctx.fillStyle = 'rgb('+cytoWordColor[band[2]]+','+cytoWordColor[band[2]]+','+cytoWordColor[band[2]]+')';
			var y2=y+10+(plotheight-mintextheight)/2;
			ctx.fillText(band[0], x+(band[1]-w)/2, y2);
			if(tosvg) svgdata.push({type:svgt_text,x:x+(band[1]-w)/2,y:y2,text:band[0],color:ctx.fillStyle,bold:true});
		}
		if(previousIsCentromere==true) {
			ctx.fillStyle = colorCentral.foreground;
			ctx.fillRect(x, y, 1, plotheight);
			if(tosvg) svgdata.push({type:svgt_line,x1:x,y1:y,x2:x,y2:y+plotheight});
		}
		previousIsCentromere=false;
	} else {
		ctx.fillStyle = centromereColor;
		ctx.fillRect(x, 3+y, band[1], plotheight-5);
		if(tosvg) svgdata.push({type:svgt_rect,x:x,y:y+3,w:band[1],h:plotheight-5,fill:ctx.fillStyle});
		var w = ctx.measureText('centromere').width;
		if(w < band[1]) {
			ctx.fillStyle = 'white';
			ctx.fillText('centromere', x+(band[1]-w)/2, 10+y);
			if(tosvg) svgdata.push({type:svgt_text,x:x+(band[1]-w)/2,y:y+10,color:ctx.fillStyle,text:'centromere',bold:true});
		}
		if(previousIsCentromere==false) {
			ctx.fillStyle = colorCentral.foreground;
			ctx.fillRect(x-1, y, 1, plotheight);
			if(tosvg) svgdata.push({type:svgt_line,x1:x-1,y1:y,x2:x-1,y2:y+plotheight});
		}
		previousIsCentromere=true;
	}
	if(band[3]) {
		// enclose head
		ctx.fillStyle = colorCentral.foreground;
		ctx.fillRect(x, y, 1, plotheight);
		if(tosvg) svgdata.push({type:svgt_line,x1:x,y1:y,x2:x,y2:y+plotheight});
	}
	if(band[4]) {
		// enclose tail
		ctx.fillStyle = colorCentral.foreground;
		ctx.fillRect(x+band[1], y, 1, plotheight);
		if(tosvg) svgdata.push({type:svgt_line,x1:x+band[1],y1:y,x2:x+band[1],y2:y+plotheight});
	}
	x += band[1];
}
return svgdata;
}



/*** __genome__ ends ***/






/*** __tiny__ ***/

function parseUrlparam(uph)
{
if(window.location.href.indexOf('?')==-1) {
	return 0;
}
var lst = window.location.href.split('?')[1].split('&');
for(var i=0; i<lst.length; i++) {
	var t = lst[i].split('=');
	if(t.length==2 && t[0].length>0 && t[1].length>0) {
		uph[t[0].toLowerCase()] = t[1];
	} else {
		return -1;
	}
}
return 1;
}

function pagemask() {loading_cloak(document.body);}

function foregroundcolor(opacity)
{
return 'rgba('+colorCentral.fg_r+','+colorCentral.fg_g+','+colorCentral.fg_b+','+opacity+')';
}

function isHmtk(ft)
{
// not good
switch(ft) {
case FT_bedgraph_c: return true;
case FT_bedgraph_n: return true;
case FT_cat_c: return true;
case FT_cat_n: return true;
case FT_bigwighmtk_c: return true;
case FT_bigwighmtk_n: return true;
default: return false;
}
}
function isCustom(ft)
{
switch(ft) {
case FT_cat_c:
case FT_bedgraph_c:
case FT_bigwighmtk_c:
case FT_bed_c:
case FT_sam_c:
case FT_bam_c:
case FT_lr_c:
case FT_cm_c:
case FT_ld_c:
case FT_anno_c:
case FT_weaver_c:
case FT_matplot:
case FT_catmat:
case FT_qcats:
	return true;
default: return false;
}
}
function isNumerical(tkobj)
{
// including density mode
var ft=tkobj.ft;
if(ft==FT_bedgraph_c||ft==FT_bedgraph_n||ft==FT_bigwighmtk_c||ft==FT_bigwighmtk_n||ft==FT_qdecor_n) return true;
if(tkobj.mode==M_den) return true;
return false;
}

function decormodestr2num(s) {
var m = s.toLowerCase();
if(m=='hide') return M_hide;
if(m=='show') return M_show;
if(m=='thin') return M_thin;
if(m=='full') return M_full;
if(m=='arc') return M_arc;
if(m=='trihm') return M_trihm;
if(m=='heatmap') return M_trihm;
if(m=='density') return M_den;
if(m=='barplot') return M_bar;
return undefined;
}

function simulateEvent(dom, action)
{
// action: click, change, mouseover,
var e = document.createEvent('MouseEvents');
e.initMouseEvent(action, true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
dom.dispatchEvent(e);
}
function int2strcomma(num) {
// integer to string with comma
}
function absolutePosition(obj)
{
var c = [0,0];
if(obj.offsetParent) {
	var o2 = obj;
	do {
		var b=parseInt(o2.style.borderLeftWidth);
		c[0] += o2.offsetLeft+(isNaN(b)?0:b);
		b=parseInt(o2.style.borderTopWidth);
		c[1] += o2.offsetTop+(isNaN(b)?0:b);
	} while(o2 = o2.offsetParent);
}
return c;
}
function stripChild(holder, what)
{
// if what==0, strip all children
var L = holder.childNodes.length;
if(what == 0) {
	while(holder.hasChildNodes())
		holder.removeChild(holder.lastChild);
} else {
	for(var i=what; i<L; i++) 
		holder.removeChild(holder.lastChild);
}
}

function neat_0t1(num)
{
if(num==0) return '0';
if(num==1) return '1';
return num.toFixed(2);
}

function neatstr(num)
{
// try make it "%.6g"
var s = num.toFixed(6);
if(s.indexOf('.')==-1) return s;
var lst = s.split('.');
var a=lst[0], b=lst[1];
while(b.length>0 && b[b.length-1]=='0') {
	b=b.substr(0,b.length-1);
}
if(b.length==0) {
	return a;
}
return a+'.'+b;
}

function bp2neatstr(a)
{
var u=['bp','Kb','Mb','Gb'];
for(var i=0; i<u.length; i++) {
	var b=Math.pow(10,(i+1)*3);
	if(a<b) {
		var v=a*1000/b;
		if(v==parseInt(v)) {
			return v+' '+u[i];
		}
		return v.toFixed(1)+' '+u[i];
	}
}
return a;
}


function lightencolor(rgb,perc) {
// lighten color, higher percentage means lighter color
    return "rgb("+(rgb[0]+parseInt((255-rgb[0])*perc))+","+(rgb[1]+parseInt((255-rgb[1])*perc))+","+(rgb[2]+parseInt((255-rgb[2])*perc))+")";
}
function darkencolor(rgb,perc) {
// darken color, higher percentage means darker color
    var p = 1-perc;
    return "rgb("+parseInt(rgb[0]*p)+","+parseInt(rgb[1]*p)+","+parseInt(rgb[2]*p)+")";
}
function colorstr2int(what)
{
// accepts #aabbcc or rgb(12,23,34)
var c = [0,0,0];
if(what.charAt(0) == "#") {
	if(what.length == 4) {
		c[0] = parseInt(what.charAt(1)+what.charAt(1), 16);
		c[1] = parseInt(what.charAt(2)+what.charAt(2), 16);
		c[2] = parseInt(what.charAt(3)+what.charAt(3), 16);
	} else {
		c[0] = parseInt(what.substr(1,2), 16);
		c[1] = parseInt(what.substr(3,2), 16);
		c[2] = parseInt(what.substr(5,2), 16);
	}
} else {
	var lst = what.split(',');
	c[0] = parseInt(lst[0].split('(')[1]);
	c[1] = parseInt(lst[1]);
	c[2] = parseInt(lst[2]);
}
return c;
}
function rgb2hex(str)
{
// must be rgb(,,)
if(str.charAt(0)=='#') return str;
var c=colorstr2int(str);
if(isNaN(c[0]) || isNaN(c[1]) || isNaN(c[2])) {
	return '#000000';
}
var h='#';
return '#'+(c[0]==0?'00':c[0].toString(16))+
(c[1]==0?'00':c[1].toString(16))+
(c[2]==0?'00':c[2].toString(16));
}
function arrayMin(arr) {
    if(arr.length == 0) fatalError('arrayMin: zero length array');
    var s = arr[0];
    for(var i=1; i<arr.length; i++) {
        if(s > arr[i]) s = arr[i];
    }
    return s;
}
function arrayMean(arr) {
    if(arr.length == 0) fatalError("arrayMean: zero length array");
    var s = 0;
    for(var i=0; i<arr.length; i++)
        s += arr[i];
    return s/arr.length;
}
function arrayMax(arr) {
    if(arr.length == 0) fatalError("arrayMax: zero length array");
    var s = 0;
    for(var i=0; i<arr.length; i++) {
        if(s < arr[i])
	    s = arr[i];
    }
    return s;
}
function getArrIdx(thing, lst) {
    // return -1 if thing is not found
    if(lst.length == 0) return -1;
    for(var i=0; i<lst.length; i++) {
        if(lst[i] == thing) return i;
    }
    return -1;
}
function stringLstIsIdentical(lst1, lst2) {
    if(lst1.length != lst2.length)
        return false;
    for(var i=0; i<lst1.length; i++) {
        if(lst1[i] != lst2[i])
	    return false;
    }
    return true;
}
function hashisempty(h) {
    for(var k in h)
        return false;
    return true;
}
function thinginlist(thing, lst) {
    for(var i=0; i<lst.length; i++) {
        if(lst[i] == thing) return true;
    }
    return false;
}
function placePanel(panel, x, y)
{
/* x/y can be missing for panel that is already shown
will adjust if it goes beyond the window
*/
var x0;
if(x==undefined) {
	x0=parseInt(panel.style.left);
} else {
	panel.style.left=x0=x;
}
var w=document.body.clientWidth+document.body.scrollLeft;
if(x0+panel.clientWidth>=w) {
	panel.style.left=Math.max(0,w-panel.clientWidth);
}
var y0;
if(y==undefined) {
	y0=parseInt(panel.style.top);
} else {
	panel.style.top=y0=y;
}
var h=document.body.clientHeight+document.body.scrollTop;
if(y0+panel.clientHeight>h)
	panel.style.top=Math.max(0,h-panel.clientHeight);
}




function gfSort_len(a,b){return b.stop-b.start-a.stop+a.start;}
function gfSort_coord(a,b)
{
// using actual genomic coord
if(a.start == b.start) return a.stop-b.stop;
return a.start-b.start;
}
function gfSort_coord_rev(a,b)
{
// using actual genomic coord
if(a.start == b.start) return b.stop-a.stop;
return b.start-a.start;
}
function numSort(a,b) { return a-b; } // ascending
function numSort2(a,b) { return b-a; } // descending
function getSelectValueById(what) {
	var tag = document.getElementById(what);
	if(tag == null) fatalError(what+' not found as select');
	if(tag.type != 'select-one')
		fatalError(what+' not found for a select tag');
	return tag.options[tag.selectedIndex].value;
}
function snpSort(a,b)
{
if(a[0]==b[0]) return a[1]-b[1];
return a[0]-b[0];
}
function hspSort(a,b)
{
if(a.querychr==b.querychr) return a.querystart-b.querystart;
//if(a.targetrid==b.targetrid) return a.targetstart-b.targetstart;
return 1;
}
function stitchSort(a,b)
{
if(Math.max(a.t1,b.t1)<Math.min(a.t2,b.t2)) {
	return a.sort_midx-(a.t2-a.t1)/5-a.sort_sumw/2-
		(b.sort_midx-(b.t2-b.t1)/5-b.sort_sumw/2);
} else {
	return a.t1-b.t1;
}
}




function changeSelectByValue(arg, value) {
/* change .selectedIndex of a <select> by given value
return 1 for success, -1 for failure
first argument could be string (<select> id), or dom object
*/
	var s = arg;
	if(typeof(s) == "string") {
		s = document.getElementById(arg);
		if(s == undefined)
			return -1;
	}
	if(s.tagName != 'SELECT') {
		print2console('changeSelectByValue: target object is not <select>',2);
		return -1;
	}
	var lst = s.options;
	for(var i=0; i<lst.length; i++) {
		if(lst[i].value == value) {
			s.selectedIndex = i;
			return 1;
		}
	}
	return -1;
}
function checkInputByvalue(radioName, value) {
// works for both radio and checkbox
	var lst = document.getElementsByName(radioName);
	if(lst.length == 0)
		fatalError("checkInputByvalue: unknown <input> name");
	for(var i=0; i<lst.length; i++) {
		if(lst[i].value == value) {
			lst[i].checked = true;
			return;
		}
	}
	fatalError("checkInputByvalue: unknown value '"+value+"' for "+radioName);
}
function getValue_by_radioName(what) {
// a set of radio button sharing same name
	var tag_lst = document.getElementsByName(what);
	if(tag_lst.length == 0) fatalError("radio button with name "+what+" not found.");
	for(var i=0; i<tag_lst.length; i++) {
		if(tag_lst[i].checked) return tag_lst[i].value;
	}
	return null;
}
function getAlt_by_radioName(what) {
	var tag_lst = document.getElementsByName(what);
	if(tag_lst.length == 0) fatalError("radio button with name "+what+" not found.");
	for(var i=0; i<tag_lst.length; i++) {
		if(tag_lst[i].checked) return tag_lst[i].alt;
	}
	fatalError("None of the options were checked for radio button "+what);
}

function makecanvaslabel(param)
{
/* make canvas with string plotted vertically
args:
- str
- color:
- bg:
- bottom: boolean if string start from bottom
- horizontal: boolean
*/
var c = document.createElement("canvas");
var ctx = c.getContext('2d');
if(param.horizontal) {
	c.height=tkAttrColumnWidth-2;
} else {
	c.width = tkAttrColumnWidth-2; // FIXME
}
if(param.bg) {
	c.style.backgroundColor=colorCentral.pagebg;
}
ctx.font = "10pt Sans-serif";
var w = ctx.measureText(param.str).width;
var truncate = false;
if(w+10 > 200) {
	if(param.horizontal) {
		c.width=200;
	} else {
		c.height = 200;
	}
	truncate = true;
} else {
	if(param.horizontal) {
		c.width=w+10;
	} else {
		c.height = w+10;
	}
}
ctx.font = "10pt Sans-serif";
ctx.fillStyle = param.color?param.color:colorCentral.foreground;
if(param.horizontal) {
	ctx.fillText(param.str,0,12);
	if(truncate) {
		var x=c.width-14;
		ctx.clearRect(x,0,14,12);
		ctx.font = "bold 11pt Georgia";
		ctx.fillText('...', x, 12);
	}
} else {
	if(param.bottom) {
		ctx.rotate(Math.PI*1.5);
		ctx.fillText(param.str, -c.height+2, 12);
	} else {
		ctx.rotate(Math.PI*0.5);
		ctx.fillText(param.str, 0, 0);
	}
	if(truncate) {
		ctx.clearRect(-14,0,14,12);
		ctx.font = "bold 11pt Georgia";
		ctx.fillText('...', -14, 12);
	}
}
return c;
}

function indicator4fly(fromdom, todom, toIsFixed)
{
/* if to app shortcut button in ftb, need to add body scrolling offset
args:
fromdom/todom: from/to dom object, used to get coord on page
toIsFixed: whether todom is position:fixed attribute, if so, need to add body scrolling offset

TODO not supports fromdom position:fixed
*/
var pos1 = absolutePosition(fromdom);
var pos2 = absolutePosition(todom);
if(toIsFixed) {
	pos2[0] += document.body.scrollLeft;
	pos2[1] += document.body.scrollTop;
}
var w1 = fromdom.clientWidth;
var h1 = fromdom.clientHeight;
var w2 = todom.clientWidth;
var h2 = todom.clientHeight;
// animate 20 frames
indicator4.style.display = 'block';
indicator4.style.width = w1;
indicator4.style.height = h1;
indicator4.style.left = pos1[0];
indicator4.style.top = pos1[1];
indicator4.count = 0;
indicator4.xincrement = (pos2[0]-pos1[0])/20;
indicator4.yincrement = (pos2[1]-pos1[1])/20;
indicator4.wshrink = (w2-w1)/20;
indicator4.hshrink = (h2-h1)/20;
indicator4actuallyfly();
}
function indicator4actuallyfly() {
    if(indicator4.count == 20) {
        indicator4.style.display = 'none';
	return;
    }
    indicator4.count++;
    indicator4.style.width = parseInt(indicator4.style.width)+indicator4.wshrink;
    indicator4.style.height = parseInt(indicator4.style.height)+indicator4.hshrink;
    indicator4.style.left = parseInt(indicator4.style.left)+indicator4.xincrement;
    indicator4.style.top = parseInt(indicator4.style.top)+indicator4.yincrement;
    setTimeout(indicator4actuallyfly, 10);
}

Genome.prototype.parseCoordinate=function(input,type)
{
/* type:
1 - array [chr, start, stop]
2 - str chr start stop
3 - str chrA start chrB stop
*/
var c=[];
switch(type) {
case 1:
	if(input.length!=3) return null;
	c[0]=c[2]=input[0];
	c[1]=input[1];
	c[3]=input[2];
	break;
case 2:
	var t=input.split(/[^\w\.]/);
	if(t.length==3) {
		c[0]=c[2]=t[0];
		c[1]=parseInt(t[1]);
		c[3]=parseInt(t[2]);
	} else {
		// remove all comma and try again
		t=input.replace(/,/g,'').split(/[^\w\.]/);
		if(t.length==3) {
			c[0]=c[2]=t[0];
			c[1]=parseInt(t[1]);
			c[3]=parseInt(t[2]);
		} else {
			return null;
		}
	}
	break;
case 3:
	var t=input.split(/[^\w\.]/);
	if(t.length!=4) return null;
	c[0]=t[0];
	c[2]=t[2];
	c[1]=parseInt(t[1]);
	c[3]=parseInt(t[3]);
	break;
default:
	fatalError('parseCoordinate: unknown type');
}
if(isNaN(c[1])) return null;
if(isNaN(c[3])) return null;
if(c[1]<0 || c[3]<=0) return null;
if(type==1 || type==2) {
	if(c[1]>=c[3]) return null;
	var len=this.scaffold.len[c[0]];
	if(!len) return null;
	if(c[1]>len) return null;
	if(c[3]>len) return null;
	return c;
}
var len=this.scaffold.len[c[0]];
if(!len) return null;
if(c[1]>len) return null;
len=this.scaffold.len[c[2]];
if(!len) return null;
if(c[3]>len) return null;
return c;
}

Browser.prototype.defaultposition=function()
{
var c=this.genome.defaultStuff.coord.split(/[^\w\.]/);
if(c.length==3) return [c[0],c[1],c[0],c[2]];
if(c.length==4) return c;
print2console('Irregular default coord: '+this.genome.defaultStuff.coord,3);
return null;
}

Browser.prototype.parseCoord_wildgoose=function(param,highlight)
{
param=param.trim();
var _len=this.genome.scaffold.len[param];
if(_len) {
	// only chr name
	var x=parseInt(_len/2);
	return [param,Math.max(x-10000,0),Math.min(x+10000,_len-1)];
}
var c=this.genome.parseCoordinate(param,2);
if(c) {
	if(c[0]==c[2]) {
		if(highlight) {
			this.__pending_coord_hl=[c[0],c[1],c[3]];
		}
		return [c[0],c[1],c[3]];
	} else {
		print2console('unexpected coord: '+c[0]+' - '+c[2],2);
		return c;
	}
}
c=param.split(/[^\w\.]/);
if(c.length==1) {
	var pos=parseInt(c[0]);
	if(isNaN(pos)) {
		return null;
	}
	// treat it as a coordinate
	if(!this.regionLst || this.regionLst.length==0) { return null; }
	var chrom=this.getDspStat()[0];
	if(pos>0 && pos<=this.genome.scaffold.len[chrom]) {
		var a=parseInt((this.hmSpan/MAXbpwidth_bold)/2);
		if(highlight) {
			this.__pending_coord_hl=[chrom,pos,pos+1];
		}
		return [chrom,Math.max(0,pos-a),pos+a];
	}
} else if(c.length==2) {
	var pos=parseInt(c[1]);
	var len=this.genome.scaffold.len[c[0]];
	if(len && !isNaN(pos) && pos>0 && pos<=len) {
		if(highlight) {
			this.__pending_coord_hl=[c[0],pos,pos+1];
		}
		var a=parseInt((this.hmSpan/MAXbpwidth_bold)/2);
		return [c[0],Math.max(0,pos-a),pos+a];
	} else {
		var a=parseInt(c[0]), b=parseInt(c[1]);
		if(!isNaN(a) && !isNaN(b)) {
			if(!this.regionLst || this.regionLst.length==0) { return null; }
			var chrom=this.getDspStat()[0];
			if(highlight) {
				this.__pending_coord_hl=[chrom,a,b];
			}
			return [chrom,a,b];
		}
	}
} else if(c.length==4) {
	if(c[0]==c[2]) return [c[0],c[1],c[3]];
	return c;
}
// try again by erasing comma, damn, all repeated!
c=param.replace(/,/g,'').split(/[^\w\.]/);
if(c.length==1) {
	var pos=parseInt(c[0]);
	if(isNaN(pos)) {
		return null;
	}
	// treat it as a coordinate
	if(!this.regionLst || this.regionLst.length==0) {
		return null;
	}
	var chrom=this.getDspStat()[0];
	if(pos>0 && pos<=this.genome.scaffold.len[chrom]) {
		var a=parseInt((this.hmSpan/MAXbpwidth_bold)/2);
		if(highlight) {
			this.__pending_coord_hl=[chrom,pos,pos+1];
		}
		return [chrom,Math.max(0,pos-a),pos+a];
	}
} else if(c.length==2) {
	var pos=parseInt(c[1]);
	var len=this.genome.scaffold.len[c[0]];
	if(len && !isNaN(pos) && pos>0 && pos<=len) {
		if(highlight) {
			this.__pending_coord_hl=[c[0],pos,pos+1];
		}
		var a=parseInt((this.hmSpan/MAXbpwidth_bold)/2);
		return [c[0],Math.max(0,pos-a),pos+a];
	} else {
		var a=parseInt(c[0]), b=parseInt(c[1]);
		if(!isNaN(a) && !isNaN(b)) {
			if(!this.regionLst || this.regionLst.length==0) { return null; }
			var chrom=this.getDspStat()[0];
			if(highlight) {
				this.__pending_coord_hl=[chrom,a,b];
			}
			return [chrom,a,b];
		}
	}
} else if(c.length==4) {
	if(c[0]==c[2]) return [c[0],c[1],c[3]];
	return c;
}
return null;
}

function pica_go(x,y)
{
// x/y does not contain scroll offset
// if is null, won't change x/y
pica.style.display='block';
if(x!=null) {
	var xx=document.body.clientWidth;
	if(x>xx-pica.clientWidth) {
		pica.style.left='';
		pica.style.right=xx-x+10;
	} else {
		pica.style.right='';
		pica.style.left=x+10;
	}
}
if(y!=null) {
	var yy=document.body.clientHeight;
	if(y>yy-pica.clientHeight) {
		pica.style.top='';
		pica.style.bottom=document.body.clientHeight-y;
	} else {
		pica.style.bottom='';
		pica.style.top=y+10;
	}
}
}

function htmltext_colorscale(minv,maxv,bg,nr,ng,nb,pr,pg,pb,nth,pth) {
/* minv,maxv
bg: background color
nr,ng,nb, pr,pg,pb,
nth,pth: color beyond p/n threshold, optional
*/
if(maxv<=0) {
	// only show negative bar
	return (nth==undefined?'':'<div style="width:10px;height:12px;display:inline-block;background-color:'+nth+';"></div> ')+
	neatstr(minv)+
	' <div style="width:50px;height:12px;display:inline-block;'+
	'background:-webkit-gradient(linear,left top,right top,from(rgb('+nr+','+ng+','+nb+')),to('+bg+'));'+
	'background:-moz-linear-gradient(left,rgb('+nr+','+ng+','+nb+'),'+bg+');"></div> '+
	neatstr(maxv);
}
if(minv>=0) {
	// only show positive bar
	return neatstr(minv)+
	' <div style="width:50px;height:12px;display:inline-block;'+
	'background:-webkit-gradient(linear,left top,right top,from('+bg+'),to(rgb('+pr+','+pg+','+pb+')));'+
	'background:-moz-linear-gradient(left,'+bg+',rgb('+pr+','+pg+','+pb+'));"></div> '+
	neatstr(maxv)+
	(pth==undefined?'':' <div style="width:10px;height:12px;display:inline-block;background-color:'+pth+';"></div>');
}
// show both bars
return (nth==undefined?'':'<div style="width:10px;height:12px;display:inline-block;background-color:'+nth+';"></div> ')+
neatstr(minv)+
' <div style="width:50px;height:12px;display:inline-block;'+
'background:-webkit-gradient(linear,left top,right top,from(rgb('+nr+','+ng+','+nb+')),to('+bg+'));'+
'background:-moz-linear-gradient(left,rgb('+nr+','+ng+','+nb+'),'+bg+');'+
'"></div> 0 <div style="width:50px;height:12px;display:inline-block;'+
'background:-webkit-gradient(linear,left top,right top,from('+bg+'),to(rgb('+pr+','+pg+','+pb+')));'+
'background:-moz-linear-gradient(left,'+bg+',rgb('+pr+','+pg+','+pb+'));'+
'"></div> '+neatstr(maxv)+
(pth==undefined?'':' <div style="width:10px;height:12px;display:inline-block;background-color:'+pth+';"></div>');
}

function pica_hide() {
pica.style.display='none';
}


function toggle_prevnode(event)
{
var d=event.target.previousSibling;
d.style.display=d.style.display=='block'?'none':'block';
}
function toggle33()
{
menu_shutup();
menu.apppanel.getseq.main.style.display='block';
menu.apppanel.getseq.shortcut.style.display='inline-block';
}
function toggle34()
{
menu.c57.shortcut.style.display='inline-block';
mdtermsearch_show('Find terms and show in colormap',mcm_addterm_closure);
}
function toggle1_1() {gflag.menu.bbj.toggle1();}
function toggle1_2() {gflag.browser.toggle1();}
Browser.prototype.toggle1=function()
{
// show hmtk facet panel
if(apps.hmtk.main.style.display=="none") {
	cloakPage();
	var b=this;
	if(this.trunk) b=this.trunk;
	b.facet.main.style.display='block';
	stripChild(apps.hmtk.holder,0);
	apps.hmtk.holder.appendChild(b.facet.main);
	var tmp=b.tkCount();
	apps.hmtk.custtk2lst.style.display= tmp[1]>0 ? 'block' : 'none';
	panelFadein(apps.hmtk.main, 100+document.body.scrollLeft, 50+document.body.scrollTop);
	apps.hmtk.bbj=b;
} else {
	pagecloak.style.display="none";
	panelFadeout(apps.hmtk.main);
}
menu_hide();
}

function toggle7_2() {gflag.browser.toggle7();}
function toggle7_1() {gflag.menu.bbj.toggle7();}
Browser.prototype.toggle7=function()
{
if(apps.custtk.main.style.display=='none') {
	for(var n in apps) {
		if(apps[n].main.style.display!='none') apps[n].main.style.display='none';
	}
	if(gflag.askabouttrack) {
		toggle9();
	}
	cloakPage();
	var c=this.genome.custtk;

	// put in custtk submit ui
	stripChild(apps.custtk.main.__contentdiv,0);
	apps.custtk.main.__contentdiv.appendChild(c.main);
	apps.custtk.main.__hbutt2.style.display=c.buttdiv.style.display=='block'?'none':'block';

	panelFadein(apps.custtk.main, 100+document.body.scrollLeft, 50+document.body.scrollTop);
	apps.custtk.bbj=this.trunk?this.trunk:this;
} else {
	pagecloak.style.display = "none";
	panelFadeout(apps.custtk.main);
}
menu_hide();
}

function toggle8_1() { gflag.menu.bbj.toggle8();}
function toggle8_2() {gflag.browser.toggle8();}
Browser.prototype.toggle8=function()
{
if(apps.publichub.main.style.display=="none") {
	if(gflag.askabouttrack) {
		toggle9();
	}
	cloakPage();
	stripChild(apps.publichub.holder,0);
	apps.publichub.holder.appendChild(this.genome.publichub.holder);
	panelFadein(apps.publichub.main, 100+document.body.scrollLeft, 50+document.body.scrollTop);
	apps.publichub.bbj=this;
} else {
	pagecloak.style.display="none";
	panelFadeout(apps.publichub.main);
}
menu_hide();
}

function toggle9()
{
pagecloak.style.display='none';
panelFadeout(gflag.askabouttrack);
delete gflag.askabouttrack;
}

function toggle13(event)
{
gflag.menu.bbj.decor_invoketksp(event);
}
function toggle14(event)
{
var cc=event.target;
gflag.allow_packhide_tkdata=cc.checked;
cc.nextSibling.nextSibling.style.display=cc.checked?'block':'none';
}

function toggle2(event) {
	event.target.style.display='none';
	event.target.nextSibling.style.display='block';
}




function plot_ruler(param)
{
/*
.ctx
.start, .stop: plotting position
.min, .max: values
.horizontal: boolean
	if true, ruler opens to bottom
		start/stop are x coord
		requires .yoffset
	if false, ruler opens to left
		start/stop are y coord
		requires .xoffset
*/
// for svg
var svgdata=[];
var svtext=param.scrollable?svgt_text:svgt_text_notscrollable;
var svline=param.scrollable?svgt_line:svgt_line_notscrollable;
var a,b,c,d;

var ctx=param.ctx;
ctx.fillStyle=param.color;
if(param.min==null || param.max==null) {
	// no data in view range
	return svgdata;
}
if(param.min>param.max) {
	param.max=param.min;
}
var ticksize=4;
var unit=10;
var total=param.max-param.min;
while(Math.pow(10,unit)>total/3) {unit--;}
unit=Math.pow(10,unit);
var sf; // px per value
var aa, bb;
if(param.horizontal) {
	a=param.start;
	b=param.yoffset;
	ctx.fillRect(a,b,1,ticksize);
	if(param.tosvg) svgdata.push({type:svline,x1:a,y1:b,x2:a,y2:b+ticksize,color:param.color});
	a=param.start;
	b=param.yoffset;
	c=param.stop-param.start;
	ctx.fillRect(a,b,c,1);
	if(param.tosvg) svgdata.push({type:svline,x1:a,y1:b,x2:a+c,y2:b,color:param.color});
	a=param.stop;
	b=param.yoffset;
	ctx.fillRect(a,b,1,ticksize);
	if(param.tosvg) svgdata.push({type:svline,x1:a,y1:b,x2:a,y2:b+ticksize,color:param.color});

	var s=neatstr(param.min);
	a=param.start;
	b=param.yoffset+ticksize+10;
	ctx.fillText(s,a,b);
	if(param.tosvg) svgdata.push({type:svtext,x:a,y:b,text:s,color:param.color});

	aa=param.start+ctx.measureText(s).width; // later use

	s=neatstr(param.max);
	var w=ctx.measureText(s).width;
	a=param.stop-w;
	b=param.yoffset+ticksize+10;
	ctx.fillText(s,a,b);
	if(param.tosvg) svgdata.push({type:svtext,x:a,y:b,text:s,color:param.color});

	bb=param.stop-w;

	sf=(param.stop-param.start)/(param.max-param.min);
} else {
	// min tick
	a=param.xoffset-ticksize;
	b=param.start;
	ctx.fillRect(a,b,ticksize,1);
	if(param.tosvg) svgdata.push({type:svline,x1:a,y1:b,x2:a+ticksize,y2:b,color:param.color});
	// vertical line
	a=param.xoffset;
	b=param.stop;
	c=param.start-param.stop+1;
	ctx.fillRect(a,b,1,c);
	if(param.tosvg) svgdata.push({type:svline,x1:a,y1:b,x2:a,y2:b+c,color:param.color});
	// max tick
	a=param.xoffset-ticksize;
	b=param.stop;
	ctx.fillRect(a,b,ticksize,1);
	if(param.tosvg) svgdata.push({type:svline,x1:a,y1:b,x2:a+ticksize,y2:b,color:param.color});
	// min v
	var s=neatstr(param.min);
	a=param.xoffset-ticksize-ctx.measureText(s).width-2;
	b=param.start;
	ctx.fillText(s,a,b);
	if(param.tosvg) svgdata.push({type:svtext,x:a,y:b,text:s,color:param.color});

	aa=param.start-10;

	// max v
	s=neatstr(param.max);
	a=param.xoffset-ticksize-ctx.measureText(s).width-2;
	b=param.stop+10+(param.max_offset?param.max_offset:0);
	ctx.fillText(s,a,b);
	if(param.tosvg) svgdata.push({type:svtext,x:a,y:b,text:s,color:param.color});

	bb=param.stop+10;

	sf=(param.start-param.stop)/(param.max-param.min);
}
if(param.extremeonly) {
	// try to put 0
	if(param.min<0 && param.max>0) {
		if(param.horizontal) {
		} else {
			a=param.xoffset-ticksize;
			b=param.stop+(param.start-param.stop)*param.max/(param.max-param.min);
			ctx.fillRect(a,b,ticksize,1);
			if(param.tosvg) svgdata.push({type:svline,x1:a,y1:b,x2:a+ticksize,y2:b,color:param.color});
		}
	}
	return svgdata;
}
for(var i=Math.ceil(param.min/unit); i<=Math.floor(param.max/unit); i++) {
	var value=unit*i;
	var str=neatstr(value);
	if(param.horizontal) {
		var x=(value-param.min)*sf+param.start;
		a=param.yoffset;
		ctx.fillRect(x,a,1,ticksize);
		if(svgdata) svgdata.push({type:svline,x1:x,y1:a,x2:x,y2:a+ticksize,color:param.color});
		var w=ctx.measureText(str).width;
		if(x-aa>w/2+2 && bb-x>w/2+2) {
			a=x-w/2;
			b=param.yoffset+ticksize+10;
			ctx.fillText(str,a,b);
			if(param.tosvg) svgdata.push({type:svtext,x:a,y:b,text:str,color:param.color});
			aa=x+w/2;
		}
	} else {
		var y=param.start-(value-param.min)*sf;
		a=param.xoffset-ticksize;
		ctx.fillRect(a,y,ticksize,1);
		if(param.tosvg) svgdata.push({type:svline,x1:a,y1:y,x2:a+ticksize,y2:y,color:param.color});
		if(aa-y>7 && y-bb>7) {
			a=param.xoffset-ticksize-2-ctx.measureText(str).width;
			b=y+5;
			ctx.fillText(str,a,b);
			if(param.tosvg) svgdata.push({type:svtext,x:a,y:b,text:str,color:param.color});
			aa=y-5;
		}
	}
}
return svgdata;
}

function drawscale_compoundtk(arg)
{
/* 3 values: top - middle -bottom
arg.h is half total height
*/
var a=arg.x,
	b=arg.y,
	c=arg.h*2+2,
	ctx=arg.ctx,
	linetype=arg.scrollable?svgt_line:svgt_line_notscrollable,
	texttype=arg.scrollable?svgt_text:svgt_text_notscrollable;
var svgdata=[];
ctx.fillRect(a,b,1,c);
if(arg.tosvg) svgdata.push({type:linetype,x1:a,y1:b,x2:a,y2:b+c,color:ctx.fillStyle});
a-=4;
ctx.fillRect(a,b,4,1);
if(arg.tosvg) svgdata.push({type:linetype,x1:a,y1:b,x2:a+4,y2:b,color:ctx.fillStyle});
b+=arg.h+1;
ctx.fillRect(a,b,4,1);
if(arg.tosvg) svgdata.push({type:linetype,x1:a,y1:b,x2:a+4,y2:b,color:ctx.fillStyle});
b+=arg.h;
ctx.fillRect(a,b,4,1);
if(arg.tosvg) svgdata.push({type:linetype,x1:a,y1:b,x2:a+4,y2:b,color:ctx.fillStyle});
// top
var w=ctx.measureText(arg.v1).width;
b=densitydecorpaddingtop+10;
ctx.fillText(arg.v1,a-w-3,b);
if(arg.tosvg) svgdata.push({type:texttype,x:a-w-3,y:b,text:arg.v1,color:ctx.fillStyle});
// middle
b+=arg.h-5;
ctx.fillText(arg.v2,a-10,b);
if(arg.tosvg) svgdata.push({type:texttype,x:a-10,y:b,text:arg.v2,color:ctx.fillStyle});
// bottom
w=ctx.measureText(arg.v3).width;
b=densitydecorpaddingtop+arg.h*2;
ctx.fillText(arg.v3,a-w-3,b);
if(arg.tosvg) svgdata.push({type:texttype,x:a-w-3,y:b,text:arg.v3,color:ctx.fillStyle});

if(arg.tosvg) return svgdata;
}


function shake_dom(dom)
{
gflag.shakedom=dom;
var l=parseInt(dom.style.left);
var s=50;
setTimeout('gflag.shakedom.style.left="'+(l-5)+'"',s);
setTimeout('gflag.shakedom.style.left="'+(l+5)+'"',s*2);
setTimeout('gflag.shakedom.style.left="'+(l-5)+'"',s*3);
setTimeout('gflag.shakedom.style.left="'+(l+5)+'"',s*4);
setTimeout('gflag.shakedom.style.left="'+l+'"',s*5);
}


function panelFadein(d, x1,y1)
{
d.style.display='block';
if(x1!=null) {
	d.style.left=x1;
	d.style.top=y1;
}
d.addEventListener('animationend',panelFadein_end,false);
d.addEventListener('webkitAnimationEnd',panelFadein_end,false);
if(d.className) {
	d.className+=' fadein';
} else {
	d.className='fadein';
}
}
function panelFadein_end(event)
{
var d=event.target;
d.removeEventListener('animationend',panelFadein_end,false);
d.removeEventListener('webkitAnimationEnd',panelFadein_end,false);
var lst=d.className.split(' ');
if(lst.length==1) {
	d.className='';
} else {
	lst.pop();
	d.className=lst.join(' ');
}
}
function panelFadeout(d)
{
d.addEventListener('animationend',panelFadeout_end,false);
d.addEventListener('webkitAnimationEnd',panelFadeout_end,false);
if(d.className) {
	d.className+=' fadeout';
} else {
	d.className='fadeout';
}
}
function panelFadeout_end(event)
{
var d=event.target;
d.removeEventListener('animationend',panelFadeout_end,false);
d.removeEventListener('webkitAnimationEnd',panelFadeout_end,false);
var lst=d.className.split(' ');
if(lst.length==1) {
	d.className='';
} else {
	lst.pop();
	d.className=lst.join(' ');
}
d.style.display='none';
}

function page_keyup(event)
{
// pushing Esc to remove any app panel that is open
if(event.keyCode!==27) return;
if(menu.style.display!='none') menu_hide();
if(menu2.style.display!='none') menu2_hide();
if(bubble.style.display!='none') bubbleHide();
for(var appname in apps) {
	if(apps[appname].main.style.display!='none') {
		if(appname=='oneshot') {
			shake_dom(apps.oneshot.main);
			return;
		}
		pagecloak.style.display='none';
		panelFadeout(apps[appname].main);
		return;
	}
}
}


function print2console(what, msgtype)
{
if(!msgconsole) {
	if(msgtype==3) alert(what);
	return;
}
switch(msgtype) {
case 0:
	// normal
	dom_addtext(msgconsole,what);
	dom_create('br',msgconsole);
	break;
case 1:
	// done
	dom_addtext(msgconsole,what,'#2A9242');
	dom_create('br',msgconsole);
	break;
case 2:
	// reminder or warning
	dom_create('div',msgconsole,'color:#E4273A;').innerHTML=what;
	shake_dom(floatingtoolbox);
	break;
case 3:
	// fatal error
	dom_create('div',msgconsole,'color:white;background-color:#E3394A;').innerHTML=what;
	shake_dom(floatingtoolbox);
	break;
default: return;
}
msgconsole.scrollTop = 9999;
}
function done() {print2console('done', 1);}


function tkishidden(t)
{
if(t.mastertk) return true;
return false;
}
function tk_height(tk)
{
if(tkishidden(tk)) return 0;
if(!tk.canvas) return 0;
return tk.canvas.height;
}
function cmtk_height(tk)
{
if(tk.cm.combine || !tk.cm.set.rd_r) return tk.qtc.height+densitydecorpaddingtop;
return 1+2*(tk.qtc.height+densitydecorpaddingtop);
}

function geneisinvalid(gene)
{
if(!gene.c || !gene.a || !gene.b) {
	gflag.badgene=gene;
	return true;
}
return false
}

Browser.prototype.bbjparamfillto_x=function(pa)
{
var vr=this.getDspStat();
if(this.is_gsv()) {
	this.gsv_savelst();
	pa.gsvparam={list:this.genesetview.savelst,viewrange:vr};
	delete pa.coord_rawstring;
} else {
	pa.coord_rawstring=vr.join(',');
	var j=this.juxtaposition;
	if(j.type==RM_jux_n||j.type==RM_jux_c) {
		pa.juxtapose_rawstring=j.what;
		if(j.type==RM_jux_c) {
			pa.juxtaposecustom=true;
		}
		delete pa.run_gsv;
	}
}
}

Browser.prototype.bbjparamfillto_tk=function(pa)
{
// mmm matplot
if(!pa.tklst) pa.tklst=[];
if(!pa.cmtk) pa.cmtk=[];
if(!pa.matplot) pa.matplot=[];
if(!pa.track_order) pa.track_order=[];
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if(t.ft==FT_cm_c) {
		pa.cmtk.push(t);
		pa.track_order.push({name:t.name,where:t.where});
	} else if(t.ft==FT_matplot) {
		pa.matplot.push(t);
		pa.track_order.push({name:t.name,where:t.where});
	} else {
		pa.tklst.push(t);
		if(!tkishidden(t)) {
			pa.track_order.push({name:t.name,where:t.where});
		}
	}
}
}


function str2jsonobj(str)
{
var j=null;
if(str[0]=='{') {
	if(str[str.length-1]=='}') {
		try{
			j=eval('('+str+')');
		} catch(err) {}
	}
} else {
	try{
		j=eval('({'+str+'})');
	} catch(err) {}
}
return j;
}

function hammockjsondesc2tk(a,b)
{
for(var k in a) {
	if(k=='categories') {
		b.cateInfo=a[k];
	} else {
		b[k]=a[k];
	}
}
}

function bbjisbusy()
{
for(var x in gflag.bbj_x_updating) {
	return true;
}
return false;
}

/*** __tiny__ ends ***/





Browser.prototype.pixelwidth2bp=function(pxw)
{
// argument: pixel width
return this.entire.atbplevel ? pxw/this.entire.bpwidth : pxw*this.entire.summarySize;
}

Browser.prototype.bp2sw=function(rid,bpw)
{
// do not consider gaps
if(this.entire.atbplevel) return bpw*this.entire.bpwidth;
return bpw/this.regionLst[rid][7];
}

Browser.prototype.cumoffset=function(rid,coord,include)
{
/* anti sx2rcoord 
recalculate xoffset for each coordinate-anchor, no need to keep track of global xoffset, lazy
from region coord to c-u-mulative x offset
special case for cottonbbj
*/
if(rid>=this.regionLst.length) return -1;
var x= 0;
var r=this.regionLst[rid];
if(r[8]) {
	/* is cotton, calling from cotton bbj, r[8] has xoffset on canvas
	coord is on query genome
	*/
	if(coord<r[3] || coord>r[4]) return -1;
	var fv=r[8].item.hsp.strand=='+';
	x=r[8].canvasxoffset+this.bp2sw(rid,fv? (coord-r[3]+(include?1:0)) : (r[4]-coord+(include?1:0)));
	for(var c in this.weaver.insert[rid]) {
		var use=false;
		if(include) {
			if(fv) use=parseInt(c)<=coord;
			else use=parseInt(c)>=coord;
		} else {
			if(fv) use=parseInt(c)<coord;
			else use=parseInt(c)>coord;
		}
		if(use) {
			x+=this.bp2sw(rid,this.weaver.insert[rid][c]);
		}
	}
	return x;
}
for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	var islk=this.weaver?this.weaver.insert[i]:null;
	if(rid==i) {
		if(coord<r[3] || coord>r[4]) return -1;
		x+= this.bp2sw(i,coord-r[3]+(include?1:0));
		if(islk) {
			for(var j in islk) {
				var use=false;
				if(include) {
					use=parseInt(j)<=coord;
				} else {
					use=parseInt(j)<coord;
				}
				if(use) x+= this.bp2sw(i,islk[j]);
			}
		}
		return x;
	} else {
		x+= this.bp2sw(i,r[4]-r[3]+1);
		if(islk) {
			for(var j in islk) {
				x+= this.bp2sw(i,islk[j]);
			}
		}
	}
}
return -1;
}

Browser.prototype.sx2rcoord=function(sx,printcoord)
{
/* anti cumoffset
screen/scrollable x to region coord, x from beginning of scrollable canvas
*/
var bpl=this.entire.atbplevel;
var hit=null;
for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	if(r[8] && r[8].canvasxoffset>sx) {
		return null;
	}
	var fv= (r[8] && r[8].item.hsp.strand=='-') ? false : true;
	var x=this.cumoffset(i,fv? r[4] : r[3]);
	if(x+regionSpacing.width<sx) {
		continue;
	}
	if(x==sx || x+regionSpacing.width==sx) {
		// hit at region rightmost edge
		hit={rid:i,
			sid: fv ? (bpl ? (r[4]-r[3]) : r[5]) : 0,
			coord: fv ? r[4] : r[3]
			};
		break;
	}
	// within this region
	var c=this.cumoffset(i, fv ? r[3] : r[4]);
	var rint= this.weaver ? this.weaver.insert[i] : null;
	// see if rint is empty
	if(rint) {
		var a=true;
		for(var b in rint) {
			if(b) {
				a=false;
				break;
			}
		}
		if(a) rint=null;
	}
	if(bpl) {
		if(fv) {
			for(var j=r[3]; j<=r[4]; j++) {
				if(rint && (j in rint)) {
					c+=rint[j]*this.entire.bpwidth;
					if(c>=sx) {
						// fall into gap, may check which insert
						hit={rid:i,sid:j-r[3],coord:j,gap:rint[j]};
						break;
					}
				}
				if(c+this.entire.bpwidth>=sx) {
					hit={rid:i,sid:j-r[3],coord:j};
					break;
				}
				c+=this.entire.bpwidth;
			}
		} else {
			for(var j=r[4]; j>=r[3]; j--) {
				if(rint && (j in rint)) {
					c+=rint[j]*this.entire.bpwidth;
					if(c>=sx) {
						// fall into gap, may check which insert
						hit={rid:i,sid:r[4]-j,coord:j,gap:rint[j]};
						break;
					}
				}
				if(c+this.entire.bpwidth>=sx) {
					hit={rid:i,sid:r[4]-j,coord:j};
					break;
				}
				c+=this.entire.bpwidth;
			}
		}
	} else {
		var incopy=null; //copy
		if(rint) {
			incopy={};
			for(var ii in rint) incopy[ii]=rint[ii];
		}
		if(fv) {
			var coord=r[3];
			for(var j=0; j<(r[4]-r[3])/r[7]; j++) {
				if(incopy) {
					var got=false;
					for(var k=0; k<Math.ceil(r[7]); k++) {
						var cc=parseInt(coord)+k;
						if(cc in incopy) {
							c+=incopy[cc]/r[7];
							if(c>=sx) {
								hit={rid:i,sid:j,coord:cc,gap:incopy[cc]};
								got=true;
								break;
							}
							delete incopy[cc];
						}
					}
					if(got) break;
				}
				coord+=r[7];
				c++;
				if(c>=sx) {
					hit={rid:i,sid:j,coord:coord};
					break;
				}
			}
		} else {
			var coord=r[4];
			for(var j=0; j<(r[4]-r[3])/r[7]; j++) {
				if(incopy) {
					var got=false;
					for(var k=0; k<Math.ceil(r[7]); k++) {
						var cc=parseInt(coord)-k;
						if(cc in incopy) {
							c+=incopy[cc]/r[7];
							if(c>=sx) {
								hit={rid:i,sid:j,coord:cc,gap:incopy[cc]};
								got=true;
								break;
							}
							delete incopy[cc];
						}
					}
					if(got) break;
				}
				coord-=r[7];
				c++;
				if(c>=sx) {
					hit={rid:i,sid:j,coord:coord};
					break;
				}
			}
		}
	}
	break;
}
if(!hit) return null;
if(printcoord) {
	hit.str= this.genome.temporal_ymd ?
		month2str[parseInt(hit.coord/100)]+' '+(hit.coord%100)+', '+this.regionLst[hit.rid][0] : 
		this.regionLst[hit.rid][0]+' '+parseInt(hit.coord);
}
return hit;
}




Browser.prototype.drawTrack_header=function(tkobj,tosvg)
{
if(tkishidden(tkobj)) return;
var color=colorCentral.foreground;
if(this.weaver && this.weaver.iscotton) {
	// cottonbbj drawing its own track
	color=this.weaver.track.qtc.bedcolor;
}
var svgdata=[];
tkobj.header.width=this.leftColumnWidth;
tkobj.header.height=tk_height(tkobj);
var ctx = tkobj.header.getContext('2d'); // for header
ctx.fillStyle=colorCentral.foreground_faint_1;
ctx.fillRect(0,0,tkobj.header.width,1);
if(tosvg) svgdata.push({type:svgt_line_notscrollable,x1:0,y1:0,x2:tkobj.header.width,y2:0,color:ctx.fillStyle});

if(tkobj.ft==FT_cm_c) {
	if(tkobj.cm.combine || !tkobj.cm.set.rd_r) {
		var min=0,max;
		if(tkobj.cm.scale) {
			max=parseInt(tkobj.cm.rdmax);
		} else {
			max=1;
		}
		var d=plot_ruler({ctx:ctx,
			stop:densitydecorpaddingtop,
			start:densitydecorpaddingtop+tkobj.qtc.height-1,
			xoffset:tkobj.header.width-1,
			horizontal:false,
			color:color,
			min:0, max:max,
			extremeonly:true,
			max_offset:-4,
			tosvg:tosvg,
			});
		if(tosvg) svgdata=svgdata.concat(d);
		if(!tkobj.cm.scale) {
			// read depth
			b=densitydecorpaddingtop+1+tkobj.qtc.height-10;
			var m=tkobj.cm.rdmax==0?'No data':'Read depth max: '+parseInt(tkobj.cm.rdmax);
			ctx.fillText(m, 1, b);
			if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:1,y:b,text:m,color:ctx.fillStyle});
		}
	} else {
		ctx.fillStyle=color;
		var ss=drawscale_compoundtk({ctx:ctx,
			x:tkobj.header.width-1,
			y:densitydecorpaddingtop,
			h:tkobj.qtc.height,
			v1:tkobj.cm.scale?parseInt(tkobj.cm.rdmax):1,
			v2:0,
			v3:tkobj.cm.scale?parseInt(tkobj.cm.rdmax):1,
			scrollable:false,
			tosvg:tosvg});

		if(tosvg) svgdata=svgdata.concat(ss);

		if(!tkobj.cm.scale) {
			// read depth
			b=densitydecorpaddingtop+1+2*tkobj.qtc.height-10;
			var m=tkobj.cm.rdmax==0?'No data':'Read depth max: '+parseInt(tkobj.cm.rdmax);
			ctx.fillText(m, 1, b);
			if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:1,y:b,text:m,color:ctx.fillStyle});
		}
		// f,r
		if(tkobj.qtc.height>=40) {
			a=tkobj.header.width-50;
			b=densitydecorpaddingtop+tkobj.qtc.height-10;
			ctx.fillText('Forward',a,b);
			if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:a,y:b,text:'Forward',color:ctx.fillStyle});
			b=densitydecorpaddingtop+tkobj.qtc.height+20;
			ctx.fillText('Reverse',a,b);
			if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:a,y:b,text:'Reverse',color:ctx.fillStyle});
		}
	}
	// label
	ctx.fillText(tkobj.label, 1, 25);
	if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:1,y:25,text:tkobj.label,color:ctx.fillStyle});
	return svgdata;
}

if(tkobj.ft==FT_weaver_c) {
	ctx.font = "bold 9pt Sans-serif";
	ctx.fillStyle=weavertkcolor_target;
	ctx.fillRect(0,1,this.leftColumnWidth,1);
	if(tosvg) svgdata.push({type:svgt_line_notscrollable,x1:0,y1:2,x2:this.leftColumnWidth,y2:1,color:ctx.fillStyle});
	var w=ctx.measureText(this.genome.name).width;
	var x=this.leftColumnWidth-w-2;
	var y=12+weavertkpad;
	ctx.fillText(this.genome.name,x,y);
	if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:x,y:y,text:this.genome.name,color:ctx.fillStyle});
	ctx.fillStyle=tkobj.qtc.bedcolor;
	ctx.fillRect(0,tkobj.canvas.height-2,this.leftColumnWidth,1);
	if(tosvg) svgdata.push({type:svgt_line_notscrollable,x1:0,y1:tkobj.canvas.height-2,x2:this.leftColumnWidth,y2:tkobj.canvas.height-1,color:ctx.fillStyle});
	y=tkobj.header.height-weavertkpad-2;
	var w=ctx.measureText(tkobj.cotton).width;
	var x=this.leftColumnWidth-w-2;
	ctx.fillText(tkobj.cotton,x,y);
	if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:x,y:y,text:tkobj.cotton,color:ctx.fillStyle});
	return svgdata;
}

var maxv=tkobj.maxv; // may not be used
var minv=tkobj.minv;
if(tkobj.group!=undefined) {
	var t=this.tkgroup[tkobj.group];
	maxv=t.max_show;
	minv=t.min_show;
} else if(tkobj.normalize) {
	maxv=this.track_normalize(tkobj,maxv);
	minv=this.track_normalize(tkobj,minv);
}

var y=0;
if(tkobj.mode==M_bar || (isNumerical(tkobj) && tkobj.qtc.height>=20) || tkobj.ft==FT_matplot || tkobj.ft==FT_qcats) {
	var d=plot_ruler({ctx:ctx,
		stop:densitydecorpaddingtop,
		start:densitydecorpaddingtop+tkobj.qtc.height-1,
		xoffset:tkobj.header.width-1,
		horizontal:false,
		color:color,
		min:minv,
		max:maxv,
		extremeonly:true,
		max_offset:-4,
		tosvg:tosvg,
		});
	if(tosvg) svgdata=svgdata.concat(d);
	if(tkobj.mode==M_bar && tkobj.showscoreidx>=0) {
		var s= tkobj.scorenamelst[tkobj.showscoreidx];
		ctx.fillText(s, 1, tkobj.qtc.height+12);
		if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:1,y:30,text:s});
	} else if(isNumerical(tkobj) && tkobj.qtc.height>=20 && tkobj.qtc.logtype!=undefined && tkobj.qtc.logtype!=log_no) {
		var s;
		if(tkobj.qtc.logtype == log_2) {
			s='(log2 scale)';
		} else if(tkobj.qtc.logtype==log_e) {
			s='(ln scale)';
		} else {
			s='(log10 scale)';
		}
		ctx.fillText(s, 1, 36);
		if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:1,y:36,text:s});
	}
	y=10;
}

// plot label
ctx.font = "8pt Sans-serif";
if(ctx.measureText(tkobj.label).width>=this.leftColumnWidth-7) {
	// clear things in the path, digit 0 is usually there when track height is not big
	var w=this.leftColumnWidth-7;
	ctx.clearRect(0,y,w,13);
	if(tosvg) svgdata.push({type:svgt_rect_notscrollable,x:0,y:y,w:w,h:13,fill:'white'});
}

y+=10;
ctx.fillStyle = color;
var label=(tkobj.cotton?tkobj.cotton+' ':'')+tkobj.label;
ctx.fillText(label, 1, y);
if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:1,y:y,text:label});

if(tkobj.ft==FT_matplot) {
	ctx.font='bold 8pt Sans-serif';
	var w=this.leftColumnWidth-2;
	var sh=11; // h for tklabel
	y+=5;
	for(var i=0; i<tkobj.tracks.length; i++) {
		if(y>=tkobj.qtc.height-sh-6) break;
		var q=tkobj.tracks[i].qtc;
		ctx.fillStyle='rgb('+q.pr+','+q.pg+','+q.pb+')';
		ctx.fillText(tkobj.tracks[i].label, 2,y+10);
		if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:2,y:y+10,text:tkobj.tracks[i].label,color:ctx.fillStyle,bold:true});
		y+=12;
	}
	return svgdata;
}

if((tkobj.mode==M_full||tkobj.mode==M_thin) && tkobj.showscoreidx!=undefined && tkobj.showscoreidx>=0) {
	var t='max: '+tkobj.maxv;
	y+=10;
	ctx.fillText(t, 1, y);
	if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:1,y:y,text:t});
	var t='min: '+tkobj.minv;
	y+=10;
	ctx.fillText(t, 1, y);
	if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:1,y:y,text:t});
}
if(tkobj.skipped>0) {
	y+=15;
	ctx.fillText(tkobj.skipped+' items not shown', 1, y);
	if(tosvg) svgdata.push({type:svgt_text_notscrollable,x:1,y:y,text:t});
	y+=10;
	ctx.fillText('(data exceeds limit)', 1, y);
}

if(tosvg) return svgdata;
}



Browser.prototype.drawTrack_browser=function(tkobj, tosvg)
{
/* draw one regular track in browser panel
not for bev or circlet
will draw main canvas and header, but not mcm
to draw a cottontk, must call from cottonbbj (but not target bbj)
*/

var yoffset=0; // reserved for future use

var tc=tkobj.canvas;
var ctx=tc.getContext("2d");
if(this.targetBypassQuerytk(tkobj)) {
	return [];
}
if(tkobj.mastertk) {
	// this tk is in a compound track, it will be drawn by its master
	return;
}
var svgdata=[];
var unitwidth = this.entire.atbplevel ? this.entire.bpwidth : 1;
if(tkobj.qtc.bg) {
	tc.style.backgroundColor=tkobj.qtc.bg;
	/* error if c is not initialized
	but no trouble as no svg would be made in beginning
	*/
	if(tosvg) svgdata.push({type:svgt_rect,x:0,y:0,w:tc.width,h:tc.height+parseInt(tc.style.paddingBottom),fill:tkobj.qtc.bg});
} else {
	tc.style.backgroundColor='';
}
// set canvas dimension
tc.width=this.entire.spnum;
// height needs to be set for a few cases, otherwise already set when stacking
if(tkobj.ft==FT_matplot || tkobj.ft==FT_qcats) {
	tc.height=tkobj.qtc.height+densitydecorpaddingtop;
} else if(isNumerical(tkobj)) {
	tc.height = tkobj.qtc.height + (tkobj.qtc.height>=20 ? densitydecorpaddingtop : 0);
} else if(tkobj.ft==FT_cat_c || tkobj.ft==FT_cat_n || tkobj.ft==FT_catmat) {
	tc.height=1+tkobj.qtc.height;
} else if(tkobj.ft==FT_catmat) {
}
ctx.clearRect(0,0,tc.width,tc.height);

if(this.weaver) {
	if(this.weaver.iscotton && this.regionLst.length==0) {
		// cottonbbj drawing a cotton tk, but got no regions
		ctx.fillStyle=colorCentral.foreground_faint_5;
		var s=tkobj.label+' - NO MATCH BETWEEN '+this.genome.name+' AND '+this.weaver.target.genome.name+' IN VIEW RANGE';
		var w=ctx.measureText(s).width;
		ctx.fillText(s,(this.hmSpan-w)/2-this.move.styleLeft,tc.height/2+5);
		this.drawTrack_header(tkobj);
		return;
	}
	if(tkobj.ft!=FT_weaver_c) {
		/* paint gap
		gap should only happen in fine mode
		*/
		ctx.fillStyle=gapfillcolor;
		for(var i=0; i<this.regionLst.length; i++) {
			var r=this.regionLst[i];
			var ins=this.weaver.insert[i];
			var fvd= (r[8] && r[8].item.hsp.strand=='-') ? false :true;
			for(var c in ins) {
				ctx.fillRect(
					this.cumoffset(i,parseInt(c)),
					yoffset, 
					this.bp2sw(i,ins[c]),
					tc.height);
			}
		}
	}
}
ctx.fillStyle=colorCentral.foreground_faint_1;
ctx.fillRect(0,yoffset,tc.width,1);
yoffset+=1;

if(tkobj.ft==FT_matplot) {
	if(!tkobj.tracks) fatalError('matplot .tracks missing');
	if(tkobj.tracks.length==0) fatalError('matplot empty .tracks');
	/* when matplot y scale has been changed, need to apply to members to take effect!
	*/
	for(var i=0; i<tkobj.tracks.length; i++) {
		var n=tkobj.tracks[i];
		if(typeof(n)=='string') {
			this.tklst.forEach(function(t){ 
				if(t.name==n) {
					t.mastertk=tkobj;
					tkobj.tracks[i]=t; 
				}
			});
		}
		qtc_paramCopy(tkobj.qtc,tkobj.tracks[i].qtc);
	}

	for(var i=0; i<tkobj.tracks.length; i++) {
		var mtk=tkobj.tracks[i];
		if(mtk.qtc.smooth) {
			smooth_tkdata(mtk);
		}
	}
	this.set_tkYscale(tkobj);
	for(var i=0; i<tkobj.tracks.length; i++) {
		var mtk=tkobj.tracks[i];
		var d=this.matplot_drawtk(tkobj,mtk,tosvg);
		if(tosvg) svgdata=svgdata.concat(d);
	}
	if(this.trunk) {
		// this is a splinter, need to plot scale
		var d=plot_ruler({ctx:ctx,
			stop:densitydecorpaddingtop,
			start:densitydecorpaddingtop+tkobj.qtc.height-1,
			xoffset:this.hmSpan-this.move.styleLeft-10,
			horizontal:false,
			color:colorCentral.foreground,
			min:tkobj.minv,
			max:tkobj.maxv,
			extremeonly:true,
			max_offset:-4,
			tosvg:tosvg,
			});
		if(tosvg) svgdata=svgdata.concat(d);
	}
} else if(tkobj.ft==FT_cm_c) {
	var d=this.cmtk_prep_draw(tkobj,tosvg);
	if(tosvg) svgdata=svgdata.concat(d);
} else if(isNumerical(tkobj)) {
	if(tkobj.qtc.smooth) {
		// smoothing may have been done upon no-move update
		if(!tkobj.data_raw) fatalError('data_raw missing');
		smooth_tkdata(tkobj);
	}
	var _d=this.drawTrack_altregiondecor(ctx,tc.height,tosvg);
	if(tosvg) svgdata=svgdata.concat(_d);

	this.set_tkYscale(tkobj);
	var data2= qtrack_logtransform(tkobj.data, tkobj.qtc);
	for(var i=0; i<this.regionLst.length; i++) {
		var r=this.regionLst[i];
		var svd=this.barplot_base({
			data:data2[i],
			ctx:ctx,
			colors:{p:'rgb('+tkobj.qtc.pr+','+tkobj.qtc.pg+','+tkobj.qtc.pb+')',
				n:'rgb('+tkobj.qtc.nr+','+tkobj.qtc.ng+','+tkobj.qtc.nb+')',
				pth:tkobj.qtc.pth,
				nth:tkobj.qtc.nth,
				barbg:tkobj.qtc.barplotbg},
			tk:tkobj,
			rid:i,
			x:this.cumoffset(i,r[3]),
			y:tkobj.qtc.height>=20?densitydecorpaddingtop:0,
			h:tkobj.qtc.height,
			pointup:true,
			tosvg:tosvg});
		if(tosvg) svgdata=svgdata.concat(svd);
		if(tosvg) {
			var _th=tk_height(tkobj);
			var x=this.cumoffset(i,r[4]);
			svgdata.push({type:svgt_line,
				x1:x, y1:0,
				x2:x, y2:_th,
				w:regionSpacing.width,
				color:regionSpacing.color});
		}
	}
	if((this.splinterTag || !this.hmheaderdiv) && tkobj.qtc.height>=20) {
		// splinter tk, draw a in-track scale as its scale is usually different with trunk
		var d=plot_ruler({ctx:ctx,
			stop:densitydecorpaddingtop,
			start:densitydecorpaddingtop+tkobj.qtc.height-1,
			xoffset:this.hmSpan-this.move.styleLeft-10,
			horizontal:false,
			color:colorCentral.foreground,
			min:tkobj.minv,
			max:tkobj.maxv,
			extremeonly:true,
			max_offset:-4,
			tosvg:tosvg,
			scrollable:true, // because scale is on tk canvas, its position subject to adjustment
			});
		if(tosvg) svgdata=svgdata.concat(d);
	}
} else if(tkobj.ft==FT_cat_c || tkobj.ft==FT_cat_n) {
	// consider merge cat to hammock
	for(var i=0; i<this.regionLst.length; i++) {
		var r=this.regionLst[i];
		var bpincrement=this.entire.atbplevel?1:r[7];
		var pastj=0;
		var pastcat=tkobj.data[i][pastj];
		while(pastcat==-1 || !(pastcat in tkobj.cateInfo)) {
			pastj++;
			if(pastj==tkobj.data[i].length) break;
			pastcat=tkobj.data[i][pastj];
		}
		for(var j=pastj+1; j<tkobj.data[i].length; j++) {
			var v = tkobj.data[i][j];
			if(v!=pastcat) {
				if(pastcat!=-1 && (pastcat in tkobj.cateInfo)) {
					var s=this.tkcd_box({
						ctx:ctx,
						rid:i,
						start:r[3]+bpincrement*pastj,
						stop:r[3]+bpincrement*(j),
						y: yoffset,
						h: tkobj.qtc.height,
						fill:tkobj.cateInfo[pastcat][1],
						tosvg:tosvg,
					});
					if(tosvg) svgdata=svgdata.concat(s);
				}
				pastj=j;
				pastcat=v;
			}
		}
		if(pastcat in tkobj.cateInfo) {
			var s=this.tkcd_box({
				ctx:ctx,
				rid:i,
				start:r[3]+bpincrement*pastj,
				stop:r[4],
				y:yoffset,
				h:tkobj.qtc.height,
				fill:tkobj.cateInfo[pastcat][1],
				tosvg:tosvg,
			});
			if(tosvg) svgdata=svgdata.concat(s);
		}
		if(tosvg) {
			var x=this.cumoffset(i,r[4]);
			svgdata.push({type:svgt_line,
				x1:x, y1:yoffset,
				x2:x, y2:yoffset+tkobj.qtc.height,
				w:regionSpacing.width,
				color:regionSpacing.color});
		}
	}
} else if(tkobj.ft==FT_catmat) {
	/* no way to be integrated with cat since cat data is summarized but
	catmat is like stack track with all data, no summary!
	*/
	var _y=yoffset;
	for(var layer=0; layer<tkobj.rowcount; layer++) {
		for(var i=0; i<this.regionLst.length; i++) {
			if(!tkobj.data[i] || tkobj.data[i].length==0) continue;
			var r=this.regionLst[i];
			var pastj=0,
				pastcat=tkobj.data[i][pastj].layers[layer],
				paststart=Math.max(r[3],tkobj.data[i][pastj].start);
			while(pastcat==-1 || !(pastcat in tkobj.cateInfo)) {
				pastj++;
				if(pastj==tkobj.data[i].length) break;
				pastcat=tkobj.data[i][pastj].layers[layer];
				paststart=Math.max(r[3],tkobj.data[i][pastj].start);
			}
			for(var j=pastj+1; j<tkobj.data[i].length; j++) {
				var v = tkobj.data[i][j].layers[layer];
				if(v!=pastcat) {
					if(pastcat!=-1 && (pastcat in tkobj.cateInfo)) {
						// must apply bar width to barplot(), or else damned
						var s=this.tkcd_box({
							ctx:ctx,
							rid:i,
							start:paststart,
							stop:Math.min(r[4],tkobj.data[i][j].start),
							y:_y,
							h:tkobj.rowheight,
							fill:tkobj.cateInfo[pastcat][1],
							tosvg:tosvg,
						});
						if(tosvg) svgdata=svgdata.concat(s);
					}
					pastj=j;
					pastcat=v;
					paststart=Math.max(r[3],tkobj.data[i][j].start);
				}
			}
			if(pastcat in tkobj.cateInfo) {
				var s=this.tkcd_box({
					ctx:ctx,
					rid:i,
					start:paststart,
					stop:Math.min(r[4],tkobj.data[i][tkobj.data[i].length-1].stop),
					y:_y,
					h:tkobj.rowheight,
					fill:tkobj.cateInfo[pastcat][1],
					tosvg:tosvg,
				});
				if(tosvg) svgdata=svgdata.concat(s);
			}
			if(tosvg) {
				var x=this.cumoffset(i,r[4]);
				svgdata.push({type:svgt_line,
					x1:x, y1:_y,
					x2:x, y2:_y+tc.height,
					w:regionSpacing.width,
					color:regionSpacing.color});
			}
		}
		_y+=tkobj.rowheight;
	}
} else if(tkobj.ft==FT_qcats) {
	// set y scale first
	yoffset+=densitydecorpaddingtop;
	var _min=0, _max=0;
	for(var i=this.dspBoundary.vstartr; i<=this.dspBoundary.vstopr; i++) {
		if(!tkobj.data[i] || tkobj.data[i].length==0) continue;
		var r=this.regionLst[i];
		var start=i==this.dspBoundary.vstartr?this.dspBoundary.vstartc:r[3];
		var stop=i==this.dspBoundary.vstopr?this.dspBoundary.vstopc:r[4];
		for(var j=0; j<tkobj.data[i].length; j++) {
			var qcats=tkobj.data[i][j].qcat;
			if(!qcats) continue;
			var __min=0, __max=0;
			for(var k=0; k<qcats.length; k++) {
				var a=qcats[k][0];
				if(a>0) __max+=a;
				else __min+=a;
			}
			// cache y range for each data point
			var __c=__min;
			for(k=0; k<qcats.length; k++) {
				var a=qcats[k][0];
				if(a==0) continue;
				qcats[k][2]=a<0?__c-a:__c+a;
				__c=qcats[k][2];
			}
			if(Math.max(tkobj.data[i][j].start,start)<Math.min(tkobj.data[i][j].stop,stop)) {
				_min=Math.min(_min,__min);
				_max=Math.max(_max,__max);
			}
		}
	}
	tkobj.minv=_min;
	tkobj.maxv=_max;
	// plot data
	for(var i=this.dspBoundary.vstartr; i<=this.dspBoundary.vstopr; i++) {
		if(!tkobj.data[i] || tkobj.data[i].length==0) continue;
		var r=this.regionLst[i];
		for(var j=0; j<tkobj.data[i].length; j++) {
			var qcats=tkobj.data[i][j].qcat;
			if(!qcats) continue;
			for(var k=0; k<qcats.length; k++) {
				var v=qcats[k][0];
				if(v==0) continue;
				// must apply bar width to barplot(), or else damned
				var _y=yoffset+tkobj.qtc.height*(_max-qcats[k][2])/(_max-_min);
				var _h=tkobj.qtc.height*Math.abs(v)/(_max-_min);
				var s=this.tkcd_box({
					ctx:ctx,
					rid:i,
					start:tkobj.data[i][j].start,
					stop:tkobj.data[i][j].stop,
					y: _y,
					h: _h,
					fill:tkobj.cateInfo[qcats[k][1]][1],
					tosvg:tosvg,
				});
				qcats[k][3]=_y;
				qcats[k][4]=_h;
				if(tosvg) svgdata=svgdata.concat(s);
			}
		}
		if(tosvg) {
			var x=this.cumoffset(i,r[4]);
			svgdata.push({type:svgt_line,
				x1:x, y1:yoffset,
				x2:x, y2:yoffset+tc.height,
				w:regionSpacing.width,
				color:regionSpacing.color});
		}
	}
} else {
	/* stack/bar/arc/trihm/weaver
	*/
	if(tkobj.ft==FT_ld_c||tkobj.ft==FT_ld_n) {
		this.regionLst=this.decoy_dsp.regionLst;
		this.dspBoundary=this.decoy_dsp.dspBoundary;
	} else if(tkobj.ft==FT_weaver_c) {
		if(!this.weaver) fatalError('but browser.weaver is unknown');
	}

	if(tkobj.qtc) {
		ctx.font = (tkobj.qtc.fontbold?'bold':'')+' '+
			(tkobj.qtc.fontsize?tkobj.qtc.fontsize:'8pt')+' '+
			(tkobj.qtc.fontfamily?tkobj.qtc.fontfamily:'sans-serif');
	}

	var drawTriheatmap = tkobj.mode==M_trihm;
	var drawArc = tkobj.mode==M_arc;
	var isSam = (tkobj.ft==FT_bam_c||tkobj.ft==FT_bam_n);
	var isChiapet = (tkobj.ft==FT_lr_n||tkobj.ft==FT_lr_c);

	var isThin = tkobj.mode==M_thin;
	var stackHeight = tkobj.qtc.stackheight?tkobj.qtc.stackheight : (isThin ? thinStackHeight : fullStackHeight);

	var startRidx=0,stopRidx=this.regionLst.length-1,
		startViewCoord=this.dspBoundary.vstartc,
		stopViewCoord=this.dspBoundary.vstopc;
	if(tkobj.ft==FT_ld_c || tkobj.ft==FT_ld_n) {
		startRidx=this.dspBoundary.vstartr;
		stopRidx=this.dspBoundary.vstopr;
	}

	var Data=tkobj.data;
	var Data2=tkobj.data_chiapet;
	if(isChiapet && (!drawArc && !drawTriheatmap)) Data=Data2;

	var old_yoffset=yoffset;

	var i,j;

	var _d=this.drawTrack_altregiondecor(ctx,tc.height,tosvg);
	if(tosvg) svgdata=svgdata.concat(_d);

	if(tkobj.ft==FT_ld_c || tkobj.ft==FT_ld_n) {
		// leave space for snp
		yoffset+=tkobj.ld.ticksize+tkobj.ld.topheight;
	}

	var vstartRidx=this.dspBoundary.vstartr,
		vstopRidx=this.dspBoundary.vstopr;

	/* score-graded tk items: lr, ld, hammock
	*/
	var pcolorscore=ncolorscore= // lr
		colorscore_min=colorscore_max=null; // hammock
	if(tkobj.ft==FT_lr_c||tkobj.ft==FT_lr_n) {
		pcolorscore=tkobj.qtc.pcolorscore;
		ncolorscore=tkobj.qtc.ncolorscore;
		if(tkobj.qtc.thtype==scale_auto) {
			var s_max=s_min=0;
			for(var i=vstartRidx; i<=vstopRidx; i++) {
				if(drawArc||drawTriheatmap) {
					for(var j=0; j<Data2[i].length; j++) {
						var item = Data2[i][j];
						if(item.boxstart==undefined || item.boxwidth==undefined) continue;
						if(item.boxstart>this.hmSpan-this.move.styleLeft || item.boxstart+item.boxwidth<-this.move.styleLeft) continue;
						var s=item.name;
						if(s>0 && s>s_max) s_max=s;
						else if(s<0 && s<s_min) s_min=s;
					}
				} else {
					for(var j=0; j<Data[i].length; j++) {
						var item = Data[i][j];
						if(item.boxstart==undefined || item.boxwidth==undefined) continue;
						if(item.boxstart>this.hmSpan-this.move.styleLeft || item.boxstart+item.boxwidth<-this.move.styleLeft) continue;
						var s;
						if(item.struct) {
							s=item.name;
						} else {
							// unmatched
							s=parseInt(item.name.split(',')[1]);
						}
						if(s>0 && s>s_max) s_max=s;
						else if(s<0 && s<s_min) s_min=s;
					}
				}
			}
			pcolorscore=tkobj.qtc.pcolorscore=s_max;
			ncolorscore=tkobj.qtc.ncolorscore=s_min;
		}
	} else if(tkobj.ft==FT_ld_c||tkobj.ft==FT_ld_n) {
		if(tkobj.showscoreidx>=0) {
			var scale=tkobj.scorescalelst[tkobj.showscoreidx];
			if(scale.type==scale_auto) {
				var s_max=s_min=0;
				for(var i=vstartRidx; i<=vstopRidx; i++) {
					for(var j=0; j<Data2[i].length; j++) {
						var item = Data2[i][j];
						if(item.boxstart==undefined || item.boxwidth==undefined) continue;
						if(item.boxstart>this.hmSpan-this.move.styleLeft || item.boxstart+item.boxwidth<-this.move.styleLeft) continue;
						var s=item.name;
						if(s>0 && s>s_max) s_max=s;
						else if(s<0 && s<s_min) s_min=s;
					}
				}
				pcolorscore=tkobj.qtc.pcolorscore=s_max;
				ncolorscore=tkobj.qtc.ncolorscore=s_min;
			} else {
				pcolorscore=tkobj.qtc.pcolorscore=scale.max;
				ncolorscore=tkobj.qtc.ncolorscore=scale.min;
			}
		} else {
		}
	} else if(tkobj.showscoreidx!=undefined && tkobj.showscoreidx>=0) {
		// hammock
		this.set_tkYscale(tkobj);
		colorscore_min=tkobj.minv;
		colorscore_max=tkobj.maxv;
	}

	// in case of drawing trihm in main panel, will measure highest dome within dsp to set track height
	var canvasstart=0-this.move.styleLeft;
	var canvasstop=canvasstart+this.hmSpan;
	var viewrangeblank=true; // if any item is drawn within view range
	if(drawArc) {
		var arcdata = [];
		/* store arc data for clicking on canvas
		each ele is for one arc/pair:
		[center x, center y, radius, region idx, array idx]
		canvas yoffset must be subtracted
		*/
		for(i=startRidx; i<=stopRidx; i++) {
			if(!Data2[i]) continue;
			for(var j=0; j<Data2[i].length; j++) {
				var item = Data2[i][j];
				if(!item.struct || item.boxstart==undefined || item.boxwidth==undefined) continue;
				if(Math.max(item.boxstart,canvasstart)<Math.min(item.boxstart+item.boxwidth,canvasstop)) {
					viewrangeblank=false;
				}
				// TODO replace pcolorscore with tkobj.maxv/.minv
				var color= (item.name >= 0) ? 
					'rgba('+tkobj.qtc.pr+','+tkobj.qtc.pg+','+tkobj.qtc.pb+','+Math.min(1,item.name/pcolorscore)+')' :
					'rgba('+tkobj.qtc.nr+','+tkobj.qtc.ng+','+tkobj.qtc.nb+','+Math.min(1,item.name/ncolorscore)+')';

				var centerx = item.boxstart+item.boxwidth/2;
				var centery = yoffset-item.boxwidth/2;
				var arcwidth=1; // TODO arc width auto-adjust
				var radius = Math.max(0,item.boxwidth/Math.SQRT2-arcwidth/2);
				ctx.strokeStyle = color;
				ctx.lineWidth=arcwidth;
				ctx.beginPath();
				ctx.arc(centerx, centery, radius, 0.25*Math.PI, 0.75*Math.PI, false);
				ctx.stroke();
				arcdata.push([centerx, centery, radius, i, j, arcwidth]);
				if(tosvg) {
					svgdata.push({type:svgt_arc,radius:radius,
						x1:item.boxstart,y1:0,
						x2:item.boxstart+item.boxwidth,y2:0,
						color:color});
				}
			}
		}
		tkobj.data_arc = arcdata;
	} else if(drawTriheatmap) {
		// canvas yoffset must be subtracted
		var hmdata = []; // for mouse click detection
		for(i=startRidx; i<=stopRidx; i++) {
			if(!(Data2[i])) continue;
			for(var j=0; j<Data2[i].length; j++) {
				var item = Data2[i][j];
				if(!item.struct || item.boxstart==undefined || item.boxwidth==undefined) continue;
				if(item.boxstart<0) continue;
				if(item.boxwidth>=this.hmSpan*2) {
					/*** if the loci spans over 2 hmspan on canvas, skip
					***/
					continue;
				}
				if(Math.max(item.boxstart,canvasstart)<Math.min(item.boxstart+item.boxwidth,canvasstop)) {
					viewrangeblank=false;
				}
				
				/* horizontal width of two mates
				the width is used as horizontal side of a isosceles
				*/
				// left
				var e = item.struct.L;
				var _r=this.regionLst[e.rid];
				var leftw = Math.max(this.cumoffset(e.rid,Math.min(_r[4],e.stop))-this.cumoffset(e.rid,Math.max(_r[3],e.start)),2);
				// right
				e = item.struct.R;
				_r=this.regionLst[e.rid];
				var rightw = Math.max(this.cumoffset(e.rid,Math.min(_r[4],e.stop))-this.cumoffset(e.rid,Math.max(_r[3],e.start)),2);
				var color= (item.name>= 0) ?
					'rgba('+tkobj.qtc.pr+','+tkobj.qtc.pg+','+tkobj.qtc.pb+','+Math.min(1,item.name/pcolorscore)+')' :
					'rgba('+tkobj.qtc.nr+','+tkobj.qtc.ng+','+tkobj.qtc.nb+','+Math.min(1,item.name/ncolorscore)+')';
				// top corner point position
				var _tan=Math.tan(tkobj.qtc.anglescale*Math.PI/4);
				var top_x = item.boxstart+item.boxwidth/2;
				var top_y = yoffset+item.boxwidth*_tan/2;
				ctx.fillStyle = color;
				ctx.beginPath();
				/*		p3
					p4		p2
						p1
				*/
				var a1=top_x,
					b1=top_y,
					a2=top_x+leftw/2,
					b2=top_y-leftw*_tan/2
					a3=top_x+leftw/2-rightw/2,
					b3=top_y-leftw*_tan/2-rightw*_tan/2,
					a4=top_x-rightw/2,
					b4=top_y-rightw*_tan/2;
				ctx.moveTo(a1,b1);
				ctx.lineTo(a2,b2);
				ctx.lineTo(a3,b3);
				ctx.lineTo(a4,b4);
				ctx.closePath();
				ctx.fill();
				hmdata.push([top_x, top_y, leftw, rightw, i, j]);
				if(tosvg) {
					svgdata.push({type:svgt_trihm,
						x1:a1,y1:b1,
						x2:a2,y2:b2,
						x3:a3,y3:b3,
						x4:a4,y4:b4,
						color:color});
				}
			}
		}
		tkobj.data_trihm = hmdata;
	} else if(tkobj.mode==M_bar) {
		/***** hammock barplot
		*/
		var y0=densitydecorpaddingtop+tkobj.qtc.height+1+yoffset;
		var bedcolor=tkobj.qtc.bedcolor,
			textcolor=tkobj.qtc.textcolor;
		var bedcolorlst=colorstr2int(bedcolor).join(','),
			textcolorlst=colorstr2int(textcolor).join(',');
		for(i=startRidx; i<=stopRidx; i++) {
			var r = this.regionLst[i];
			if(Data[i]==undefined) {
				continue;
			}
			var regionstart = r[3];
			var regionstop = r[4];
			for(var j=0; j<Data[i].length; j++) {
				var item = Data[i][j];
				if(item.boxstart==undefined || !item.boxwidth) continue;
				if(Math.max(item.boxstart,canvasstart)<Math.min(item.boxstart+item.boxwidth,canvasstop)) {
					viewrangeblank=false;
				}
				// may category-specific style
				if(item.category!=undefined && tkobj.cateInfo && (item.category in tkobj.cateInfo)) {
					// apply category color
					textcolor=bedcolor=tkobj.cateInfo[item.category][1];
					bedcolorlst=colorstr2int(bedcolor).join(',');
				}
				// item
				var a=y0+item.stack*(fullStackHeight+1);
				var _d=this.tkcd_item({
					item:item,
					ctx:ctx,
					stackHeight:fullStackHeight,
					y:a,
					tkobj:tkobj,
					bedcolor:bedcolor,
					textcolor:textcolor,
					region_idx:i,
					tosvg:tosvg,
					});
				if(tosvg) svgdata=svgdata.concat(_d);
				// bar
				var score=Infinity;
				var thiscolor=bedcolorlst;
				if(item.scorelst && tkobj.showscoreidx!=undefined && tkobj.showscoreidx!=-1) {
					score=item.scorelst[tkobj.showscoreidx];
				}
				_d=this.barplot_uniform({
					score:score,
					ctx:ctx,
					colors:{p:'rgba('+thiscolor+',.6)',
						n:'rgba('+thiscolor+',.6)',
						},
					tk:tkobj,
					rid:i,
					y:densitydecorpaddingtop,
					h:tkobj.qtc.height,
					pointup:true,
					tosvg:tosvg,
					start:Math.max(r[3],item.start),
					stop:Math.min(r[4],item.stop)});
				if(tosvg) svgdata=svgdata.concat(_d);
			}
		}
		if(!viewrangeblank && (this.splinterTag || !this.hmheaderdiv)) {
			// scale
			var d=plot_ruler({ctx:ctx,
				stop:densitydecorpaddingtop,
				start:y0-2,
				xoffset:this.hmSpan-this.move.styleLeft-10,
				horizontal:false,
				color:colorCentral.foreground,
				min:colorscore_min,
				max:colorscore_max,
				extremeonly:true,
				max_offset:-4,
				tosvg:tosvg,
				scrollable:true, // because scale is on tk canvas, its position subject to adjustment
				});
			if(tosvg) svgdata=svgdata.concat(d);
		}
	} else if(tkobj.ft==FT_weaver_c && tkobj.weaver.mode==W_rough) {
		// stitched hsp
		/* rank stitch by combined length:
		  sum of target length of all hsp pieces
		  entire span of query
		*/
		var srank=[];
		for(var i=0; i<tkobj.weaver.stitch.length; i++) {
			var a=tkobj.weaver.stitch[i];
			var c=0;
			for(var j=0; j<a.lst.length; j++) {
				c+=a.lst[j].targetstop-a.lst[j].targetstart;
			}
			srank.push([c,i,c+a.stop-a.start]);
		}
		srank.sort(function(m,n){return n[2]-m[2];});
		var xspacer=5;
		var blob=[];
		// go over all stitches
		for(var i=0; i<srank.length; i++) {
			var stp=tkobj.weaver.stitch[srank[i][1]];
			var targetx1=9999,targetx2=0;
			for(var j=0; j<stp.lst.length; j++) {
				targetx1=Math.min(targetx1,stp.lst[j].t1);
				targetx2=Math.max(targetx2,stp.lst[j].t2);
			}
			var stpw=(stp.stop-stp.start)/this.entire.summarySize; // stitch width on canvas
			// ideal stitch position
			stp.canvasstart=(targetx1+targetx2)/2-stpw/2;
			stp.canvasstop=Math.min(stp.canvasstart+stpw,this.entire.spnum);

			// 1: horizontal shift to fit unbalanced hsp distribution on target
			var mc=srank[i][0]; // mid target coord (adding up)
			var x0=stp.t1,x9=stp.t2;
			if(stpw>x9-x0) {
				// stitch on screen width wider than target, no shifting
			} else {
				mc/=2;
				var midx0=(x9+x0)/2;
				// find middle point of all hsp on canvas
				var add=0;
				var midx=-1;
				for(j=0; j<stp.lst.length; j++) {
					var h=stp.lst[j];
					if(mc>=add && mc<=add+h.targetstop-h.targetstart) {
						midx=this.cumoffset(h.targetrid, h.targetstart+mc-add);
						break;
					}
					add+=h.targetstop-h.targetstart;
				}
				if(midx>midx0) {
					// shift to right
					stp.canvasstop = Math.min(x9, stp.canvasstop+midx-midx0);
					stp.canvasstart=stp.canvasstop-stpw;
				} else {
					stp.canvasstart = Math.max(x0, stp.canvasstart-(midx0-midx));
					stp.canvasstop=stp.canvasstart+stpw;
				}
			}

			// 2: find a slot to put this one and look through previously placed stitches
			var nohit=true;
			for(var j=0; j<blob.length; j++) {
				if(Math.max(blob[j][0],stp.canvasstart)<Math.min(blob[j][1],stp.canvasstop)) {
					// hit one
					nohit=false;
					if(stp.canvasstart+stp.canvasstop < blob[j][0]+blob[j][1]) {
						// new one is towards blob's left
						if(blob[j][0]<stpw+xspacer-this.move.styleLeft) {
							// no space on left
							stitchblob_insertright(blob,j,stp,stpw,xspacer);
						} else {
							var succ=stitchblob_insertleft(blob,j,stp,stpw,xspacer);
							if(!succ) {
								stitchblob_insertright(blob,j,stp,stpw,xspacer);
							}
						}
					} else {
						stitchblob_insertright(blob,j,stp,stpw,xspacer);
					}
				}
			}
			if(nohit) {
				// no hit to blob
				stitchblob_new(blob,stp);
			}
		}

		/* try to fit the last stitch all inside view range
		so that a flipped query region with items on its tail can be seen joining with the previous query region
		(as of fusion gene)
		if(tkobj.weaver.stitch.length>0) {
			var stch=tkobj.weaver.stitch[tkobj.weaver.stitch.length-1];
			if(stch.canvasstart<this.hmSpan-this.move.styleLeft) {
				stch.canvasstop=Math.min(stch.canvasstop,this.entire.spnum);
			}
		}
		*/

		// shrink and shift if any stitch is outside viewrange
		var outvr=false;
		for(var i=0; i<tkobj.weaver.stitch.length; i++) {
			var a=tkobj.weaver.stitch[i];
			if(a.canvasstart<-this.move.styleLeft || a.canvasstop>this.hmSpan-this.move.styleLeft) {
				outvr=true;
				break;
			}
		}
		if(outvr) {
			var minx=9999, maxx=0; // min/max x pos of all stitches
		}

		var stitchbarh=10;
		var y2=tc.height-11;

		// rank stitch again by xpos
		srank=[];
		for(var i=0; i<tkobj.weaver.stitch.length; i++) {
			srank.push([tkobj.weaver.stitch[i].canvasstart,i]);
		}
		srank.sort(function(m,n){return m[0]-n[0];});
		var newlst=[];
		for(var i=0; i<srank.length; i++) {
			newlst.push(tkobj.weaver.stitch[srank[i][1]]);
		}
		tkobj.weaver.stitch=newlst;

		for(var i=0; i<tkobj.weaver.stitch.length; i++) {
			var stp=tkobj.weaver.stitch[i];
			viewrangeblank=false;
			ctx.clearRect(stp.canvasstart-xspacer,y2,stp.canvasstart+300,20);
			// query bar
			var clst=colorstr2int(tkobj.qtc.bedcolor);
			ctx.fillStyle=lightencolor(clst,.8);
			var a=stp.canvasstop-stp.canvasstart;
			ctx.fillRect(stp.canvasstart,y2,a,stitchbarh);
			if(tosvg) svgdata.push({type:svgt_rect,x:stp.canvasstart,y:y2,w:a,h:stitchbarh,fill:ctx.fillStyle});
			// query coord
			var a=stp.chr+':'+stp.start+'-'+stp.stop+', '+bp2neatstr(stp.stop-stp.start);
			var w=ctx.measureText(a).width;
			ctx.fillStyle=tkobj.qtc.bedcolor;
			var b=Math.max(stp.canvasstart,(stp.canvasstart+stp.canvasstop-w)/2);
			ctx.fillText(a,b,tc.height-1);
			if(w<stp.canvasstop-stp.canvasstart) {
				if(tosvg) svgdata.push({type:svgt_text,x:b,y:tc.height-1,text:a,color:ctx.fillStyle});
			}
			// hsps
			var sf=(stp.canvasstop-stp.canvasstart)/(stp.stop-stp.start); // px / bp on stitch
			for(var j=0; j<stp.lst.length; j++) {
				var y3=y2-1;
				var hsp=stp.lst[j];
				var t1=hsp.t1;
				var t2=hsp.t2;
				var q1=stp.canvasstart+sf*((hsp.strand=='+'?hsp.querystart:hsp.querystop)-stp.start);
				var q2=stp.canvasstart+sf*((hsp.strand=='+'?hsp.querystop:hsp.querystart)-stp.start);
				hsp.q1=q1;
				hsp.q2=q2;

				ctx.fillStyle=weavertkcolor_target;
				ctx.fillRect(t1,yoffset,Math.max(1,t2-t1),1);
				if(tosvg) svgdata.push({type:svgt_line,x1:t1,y1:yoffset+.5,x2:t2,y2:yoffset+.5,w:1,color:ctx.fillStyle});
				ctx.fillStyle=tkobj.qtc.bedcolor;
				if(hsp.strand=='+') {
					ctx.fillRect(q1,y3, Math.max(1, q2-q1), 1);
				} else {
					ctx.fillRect(q2,y3, Math.max(1, q1-q2), 1);
				}
				if(tosvg) svgdata.push({type:svgt_line,x1:q1,y1:y3-.5,x2:q2,y2:y3-.5,w:1,color:ctx.fillStyle});
				// thinner the band, darker the color
				var op=0.3;
				if(t2-t1<1) {
					op=0.5;
				} else if(t2-t1<5) {
					op=0.3+(5-t2+t1)*0.2/5;
				}
				ctx.fillStyle='rgba('+clst+','+op.toFixed(2)+')';
				ctx.beginPath();
				ctx.moveTo(t1,yoffset+1);
				ctx.lineTo(t2-t1<1?t1+1:t2,yoffset+1);
				ctx.lineTo(Math.abs(q2-q1)<1?q1+1:q2,y3);
				ctx.lineTo(q1,y3);
				ctx.closePath();
				ctx.fill();
				if(tosvg) svgdata.push({type:svgt_polygon,points:[[t1,yoffset+1],[t2,yoffset+1],[q2,y3],[q1,y3]],fill:ctx.fillStyle});
			}
		}
		this.weaver_stitch2cotton(tkobj);
	} else {
		/** stack **/
		if(tkobj.ft==FT_weaver_c) {
			if(tkobj.weaver.mode!=W_fine) fatalError('weavertk supposed to be in fine mode');
			this.weaver_hsp2cotton(tkobj);
		}
		var bedcolor, textcolor, bedcolorlst, textcolorlst,
			fcolor, rcolor, mcolor;
		if(isSam) {
			fcolor = tkobj.qtc.forwardcolor;
			rcolor = tkobj.qtc.reversecolor;
			mcolor = tkobj.qtc.mismatchcolor;
		} else if(isChiapet) {
			// include lr and ld
			textcolor=tkobj.qtc.textcolor;
			textcolorlst=colorstr2int(textcolor).join(',');
			// cannot use bedcolor as it use different color for +/- score
		} else {
			bedcolor=tkobj.qtc.bedcolor;
			textcolor=tkobj.qtc.textcolor;
			bedcolorlst=colorstr2int(bedcolor).join(',');
			if(!textcolor) {
				// not given in weavertk
				textcolor=colorCentral.foreground;
			}
			textcolorlst=colorstr2int(textcolor).join(',');
		}
		var hspdiststrx=0; // for weaver fine hsp
		for(i=startRidx; i<=stopRidx; i++) {
			var r = this.regionLst[i];
			if(Data[i]==undefined) {
				continue;
			}
			var regionstart = r[3];
			var regionstop = r[4];
			for(var j=0; j<Data[i].length; j++) {
				if(Data[i][j].stack == undefined) {
					continue;
				}
				var item = Data[i][j];
				if(Math.max(item.boxstart,canvasstart)<Math.min(item.boxstart+item.boxwidth,canvasstop)) {
					viewrangeblank=false;
				}
				// plotting will be curbed by start/stop of both item and region
				var curbstart = Math.max(regionstart, item.start);
				var curbstop = Math.min(regionstop, item.stop);

				var y = yoffset + item.stack*( stackHeight +1 );

				if(tkobj.ft==FT_weaver_c) {
					// fine hsp
					var _d=this.tkcd_item({item:item,
						ctx:ctx,
						y:y+1+weavertkpad,
						tkobj:tkobj,
						region_idx:i,
						tosvg:tosvg,
						});
					if(tosvg) svgdata=svgdata.concat(_d);
					var phs=null; // previous hsp
					if(j>0) {
						phs=Data[i][j-1].hsp;
					} else if(i>0) {
						var bi=i-1;
						while(bi>=0) {
							if(Data[bi].length>0) {
								phs=Data[bi][Data[bi].length-1];
								break;
							}
							bi--;
						}
					}
					if(!phs) continue;
					// target dist
					var s=bp2neatstr(item.hsp.targetstart-phs.targetstop);
					var w=ctx.measureText(s).width;
					var cspace=item.hsp.canvasstart-phs.canvasstop;
					if(w+6<cspace) {
						ctx.fillStyle=weavertkcolor_target;
						var x=(item.hsp.canvasstart+phs.canvasstop-w)/2,
							y2=y+weavertkpad+10;
						ctx.fillText(s,x,y2);
						if(tosvg) svgdata.push({type:svgt_text,x:x,y:y2,text:s,color:ctx.fillStyle});
					}
					// query dist
					ctx.fillStyle=tkobj.qtc.bedcolor;
					var s;
					if(phs.querychr==item.hsp.querychr) {
						if(Math.max(phs.querystart,item.hsp.querystart)<Math.min(phs.querystop,item.hsp.querystop)) {
							s='overlap';
						} else {
							var dist= phs.querystop == item.hsp.querystart ? 0 :
								(phs.querystop < item.hsp.querystart ?
								(item.hsp.querystart-phs.querystop) :
								(phs.querystart-item.hsp.querystop));
							s=bp2neatstr(dist);
						}
					} else {
						s='not connected';
					}
					var w=ctx.measureText(s).width;
					var y2=y+weavertkpad+(item.stack+1)*tkobj.qtc.stackheight;
					var x=(item.hsp.canvasstart+phs.canvasstop-w)/2;
					if(w+6<cspace) {
						ctx.fillText(s,x,y2);
						if(tosvg) svgdata.push({type:svgt_text,x:x,y:y2,text:s,color:ctx.fillStyle});
					} else {
						// underneath
						ctx.strokeStyle=tkobj.qtc.bedcolor;
						ctx.beginPath();
						var b=y2+weavertk_hspdist_strpad;
						if(x-10>hspdiststrx) {
							var a=phs.canvasstop;
							ctx.moveTo(a,y2);
							ctx.lineTo(a-3,b);
							if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:y2,x2:a-3,y2:b,w:1,color:ctx.strokeStyle});
							a=item.hsp.canvasstart;
							ctx.moveTo(a,y2);
							ctx.lineTo(a+3,y2+weavertk_hspdist_strpad);
							ctx.stroke();
							if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:y2,x2:a+3,y2:b,w:1,color:ctx.strokeStyle});
						} else {
							x=hspdiststrx+10;
							var x2=(phs.canvasstop+item.hsp.canvasstart)/2;
							ctx.moveTo(x2,y2);
							ctx.lineTo(x+w/2,b);
							ctx.stroke();
							if(tosvg) svgdata.push({type:svgt_line,x1:x2,y1:y2,x2:x+w/2,y2:b,w:1,color:ctx.strokeStyle});
						}
						hspdiststrx=x+w+3;
						var y3=y2+weavertk_hspdist_strpad+weavertk_hspdist_strh;
						ctx.fillText(s,x,y3);
						if(tosvg) svgdata.push({type:svgt_text,x:x,y:y3,text:s,color:ctx.fillStyle});
					}
					continue;
				}

				if(isSam) {
					/**************
						bam read 
					 **************/
					if(item.hasmate) {
						/** paired read **/
						var rd1=item.struct.L;
						var rd2=item.struct.R;
						var _s=this.plotSamread(ctx,
							rd1.rid,
							rd1.start,
							rd1.bam,
							y,
							stackHeight,
							rd1.strand=='>'?fcolor:rcolor,
							mcolor,
							tosvg);
						if(tosvg) svgdata=svgdata.concat(_s);
						var _s=this.plotSamread(ctx,
							rd2.rid,
							rd2.start,
							rd2.bam,
							y,
							stackHeight,
							rd2.strand=='>'?fcolor:rcolor,
							mcolor,
							tosvg);
						if(tosvg) svgdata=svgdata.concat(_s);

						// line joining the pair
						var linestart,linestop;
						if(rd1.rid==rd2.rid) {
							linestart=this.cumoffset(i,Math.min(rd1.stop,rd2.stop));
							linestop=this.cumoffset(i,Math.max(rd1.start,rd2.start));
						} else {
							var fvd=(r[8] && r[8].item.hsp.strand=='-')?false:true;
							linestart=this.cumoffset(i, fvd ?
								Math.min(r[4],rd1.stop) : Math.max(r[3],rd1.start));
							var r2=this.regionLst[rd2.rid];
							fvd=(r2[8] && r2[8].item.hsp.strand=='-')?false:true;
							linestop=this.cumoffset(rd2.rid, fvd ?
								Math.max(r2[3],rd2.start) : Math.min(r2[4],rd2.stop));
						}
						if(linestart>=0 && linestop>=0) {
							var y2 = (isThin ? y : y+4)+.5;
							ctx.strokeStyle = colorCentral.foreground_faint_5;
							ctx.lineWidth=1;
							ctx.moveTo(linestart,y2);
							ctx.lineTo(linestop,y2);
							ctx.stroke();
							if(tosvg) svgdata.push({type:svgt_line, x1:linestart,y1:y2, x2:linestop, y2:y2, w:1, color:ctx.fillStyle});
						}
						continue;
					}
					/** single read **/
					var _s=this.plotSamread(ctx,
						i,
						item.start,
						item.bam,
						y,
						stackHeight,
						item.strand=='>'?fcolor:rcolor,
						mcolor,
						tosvg);
					if(tosvg) svgdata=svgdata.concat(_s);
					continue;
				}

				// figure out box/text color for this item
				if(isChiapet) {
					/* if has mate, .name is score
					else, name is coord plus score, joined by comma
					*/
					var thisscore = (item.struct) ? item.name : parseFloat(item.name.split(',')[1]);
					bedcolor= (thisscore>= 0) ?
						'rgba('+tkobj.qtc.pr+','+tkobj.qtc.pg+','+tkobj.qtc.pb+','+Math.min(1,thisscore/pcolorscore)+')' :
						'rgba('+tkobj.qtc.nr+','+tkobj.qtc.ng+','+tkobj.qtc.nb+','+Math.min(1,thisscore/ncolorscore)+')';
					textcolor= (thisscore>= 0) ?
						'rgba('+textcolorlst+','+Math.min(1,thisscore/pcolorscore)+')' :
						'rgba('+textcolorlst+','+Math.min(1,thisscore/ncolorscore)+')';
				} else {
					if(item.category!=undefined && tkobj.cateInfo && (item.category in tkobj.cateInfo)) {
						textcolor=bedcolor=tkobj.cateInfo[item.category][1];
						bedcolorlst=colorstr2int(bedcolor).join(',');
						textcolorlst=colorstr2int(textcolor).join(',');
					}
					if(item.scorelst && tkobj.showscoreidx!=undefined && tkobj.showscoreidx>=0) {
						// here it allows an item to be not having score data!
						var _rv=tkobj.maxv-tkobj.minv;
						var thisscore=item.scorelst[tkobj.showscoreidx];
						textcolor= 'rgba('+textcolorlst+','+Math.min(1,(thisscore-tkobj.minv)/_rv)+')';
						bedcolor= 'rgba('+bedcolorlst+','+Math.min(1,(thisscore-tkobj.minv)/_rv)+')';
					}
				}

				if(isThin) {
					/***  thin  TODO thin/full merge ***/
					var _d=this.tkcd_box({
						ctx:ctx,
						rid:i,
						start:item.start,
						stop:item.stop,
		viziblebox:true,
						y:y,
						h:stackHeight,
						fill:bedcolor,
						tosvg:tosvg,
					});
					if(tosvg) svgdata=svgdata.concat(_d);
				} else {
					/* full mode */
					var _d=this.tkcd_item({item:item,
						ctx:ctx,
						stackHeight:stackHeight,
						y:y,
						tkobj:tkobj,
						bedcolor:bedcolor,
						textcolor:textcolor,
						isChiapet:isChiapet,
						region_idx:i,
						tosvg:tosvg,
						});
					if(tosvg) svgdata=svgdata.concat(_d);
				}
			}
		}
		if(tkobj.ft==FT_weaver_c) {
			// done fiddling with hsp
			if(tkobj.weaver.mode!=W_fine) fatalError('weavertk supposed to be in fine mode');
			var cbj= this.weaver.q[tkobj.cotton];
			if(cbj.tklst.length>0 || cbj.init_bbj_param) {
				for(var a=0; a<cbj.regionLst.length; a++) {
					var b=cbj.regionLst[a];
					b[8].canvasxoffset=b[8].item.hsp.canvasstart;
				}
				this.weaver_cotton_spin(cbj);
			}
		}
	}
	if(viewrangeblank) {
		ctx.fillStyle=colorCentral.foreground_faint_5;
		var s=tkobj.label+' - NO DATA IN VIEW RANGE';
		var w=ctx.measureText(s).width;
		ctx.fillText(s,(this.hmSpan-w)/2-this.move.styleLeft,tc.height/2+5);
	} else if(tkobj.ft==FT_ld_c || tkobj.ft==FT_ld_n) {
		// plot snps from the LD track
		yoffset=old_yoffset;
		ctx.strokeStyle=colorCentral.foreground;
		ctx.beginPath();
		var a=yoffset+tkobj.ld.ticksize+.5;
		ctx.moveTo(0,a);
		ctx.lineTo(tc.width,a);
		if(tosvg) svgdata.push({type:svgt_line,x1:0,y1:a,x2:tc.width,y2:a,color:ctx.strokeStyle});
		for(var n in tkobj.ld.hash) {
			var rs=tkobj.ld.hash[n];
			var a=rs.topx,
				b=yoffset,
				c=yoffset+tkobj.ld.ticksize,
				d=rs.bottomx,
				e=yoffset+tkobj.ld.ticksize+tkobj.ld.topheight;
			// tick
			ctx.moveTo(a,b);
			ctx.lineTo(a,c);
			if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:b,x2:a,y2:c,color:ctx.strokeStyle});
			// link
			ctx.lineTo(d,e);
			if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:c,x2:d,y2:e,color:ctx.strokeStyle});
		}
		ctx.stroke();
	}

	/* always redraw .atC
	as the .atC height must be same as .canvas and it would be shown in ghm */
	this.drawMcm_onetrack(tkobj);

	if(tkobj.ft==FT_ld_c||tkobj.ft==FT_ld_n) {
		this.regionLst=this.decoy_dsp.bak_regionLst;
		this.dspBoundary=this.decoy_dsp.bak_dspBoundary;
	}
}

// horizontal line
if(tkobj.horizontallines && 
	(isNumerical(tkobj) || tkobj.ft==FT_matplot || tkobj.ft==FT_cm_c) && 
	tkobj.qtc.height>=20 &&
	(tkobj.maxv!=undefined && tkobj.minv!=undefined)) {
	for(var i=0; i<tkobj.horizontallines.length; i++) {
		var v=tkobj.horizontallines[i];
		if(v.value>tkobj.minv && v.value<tkobj.maxv) {
			var y=parseInt(densitydecorpaddingtop+tkobj.qtc.height*(tkobj.maxv-v.value)/(tkobj.maxv-tkobj.minv));
			ctx.fillStyle=v.color;
			ctx.fillRect(0,y,tc.width,1);
			if(tosvg) svgdata.push({type:svgt_line, x1:0,y1:y, x2:tc.width, y2:y, w:1, color:ctx.fillStyle});
			v._y=y;
		}
	}
}

this.drawTrack_header(tkobj);

if(this.trunk) {
	// is splinter
	this.trunk.synctkh_padding(tkobj.name);
} else {
	// is trunk
	for(var tag in this.splinters) {
		var b=this.splinters[tag];
		var o=b.findTrack(tkobj.name);
		if(o) {
			o.canvas.width=o.canvas.width;
			b.drawTrack_browser(o,false);
		} else {
			/* in case of splinting, unfinished chip is inserted into trunk.splinters
			and resizing trunk will re-draw all tracks in trunk
			but the splinter tracks are not ready
			*/
		}
	}
	this.synctkh_padding(tkobj.name);
}
// highlight region
if(!this.is_gsv()) {
	for(var i=0; i<this.highlight_regions.length; i++) {
		var pos=this.region2showpos(this.highlight_regions[i]);
		if(!pos) continue;
		var hc=colorstr2int(colorCentral.hl);
		for(var j=0; j<pos.length; j++) {
			var w=pos[j][1];
			if(!w || w>this.hmSpan*.75) continue;
			ctx.fillStyle='rgba('+hc[0]+','+hc[1]+','+hc[2]+','+0.5*(1-w/(this.hmSpan*.75))+')';
			ctx.fillRect(pos[j][0],0,Math.max(2,w),tc.height);
		}
	}
}

return svgdata;
}



Browser.prototype.drawTrack_altregiondecor=function(ctx,height,tosvg)
{
if(this.juxtaposition.type==this.genome.defaultStuff.runmode) return [];
var svgdata=[];
for(var i=0; i<this.regionLst.length; i++) {
	var x1=this.cumoffset(i,this.regionLst[i][3]),
		x2=this.cumoffset(i,this.regionLst[i][4]);
	if(i % 2) {
		ctx.fillStyle=colorCentral.background_faint_5;
		ctx.fillRect(x1, 0, x2-x1, height);
	}
	ctx.fillStyle=regionSpacing.color;
	ctx.fillRect(x2,0,1,height);
	if(tosvg) svgdata.push({type:svgt_line,x1:x2,y1:0,x2:x2,y2:height,w:1,color:ctx.fillStyle});
}
return svgdata;
}




Browser.prototype.stack_track=function(tkobj, yoffset)
{
var ft=tkobj.ft;
if(tkishidden(tkobj) || isNumerical(tkobj) || ft==FT_cat_n || ft==FT_cat_c || ft==FT_cm_c ||
	ft==FT_matplot || ft==FT_catmat) return;

if(tkobj.ft==FT_ld_c || tkobj.ft==FT_ld_n) {
	if(tkobj.ld.data.length==0) return;
} else {
	if(tkobj.data.length==0) return;
}

if(this.targetBypassQuerytk(tkobj)) return;

var canvas = tkobj.canvas; // will also set canvas height
canvas.width=this.entire.spnum;
var ctx = canvas.getContext('2d');


/* list of regions to be used for data processing:
ldtk - view range only!
rest - lw to rw
*/
var startRidx,stopRidx,
	startViewCoord, stopViewCoord;

if(ft==FT_ld_c || ft==FT_ld_n) {
	startRidx=this.dspBoundary.vstartr;
	stopRidx=this.dspBoundary.vstopr;
	startViewCoord=this.dspBoundary.vstartc;
	stopViewCoord=this.dspBoundary.vstopc;
	
	/* ld data preprocessing
	in case of multi-region (juxtaposition or geneset)
	synthetic lr items would not be in multiregions
	*/
	tkobj.ld.hash={}; // key: snp rs, val: {rid:?, coord:?, topx:?, bottomx:? }
	// 
	/* rid/coord is real info
	topx/bottomx: plotting offset on the linkage graph
	*/
	// 1. get all snps
	var count=0; // total count of snp
	for(i=startRidx; i<=stopRidx; i++) {
		var r=this.regionLst[i];
		var startcoord=i==startRidx?startViewCoord:r[3];
		var stopcoord=i==stopRidx?stopViewCoord:r[4];
		for(var j=0; j<tkobj.ld.data[i].length; j++) {
			var k=tkobj.ld.data[i][j];
			if(k.start<startcoord) continue;
			if(k.stop<=stopcoord) {
				// valid pair
				var x1=this.cumoffset(i,k.start),
					x2=this.cumoffset(i,k.stop);
				if(x1>=0 && x2>x1) {
					tkobj.ld.hash[k.rs1]={rid:i,coord:k.start, topx:x1};
					tkobj.ld.hash[k.rs2]={rid:i,coord:k.stop, topx:x2};
				}
			} else {
				/* look through remaining regions
				snp pairs that form ld are always on same chr, so no chr info is given for each snp
				will only use coord to detect region
				*/
				for(var m=i+1; m<=stopRidx; m++) {
					var r2=this.regionLst[m];
					if(r2[0]!=r[0]) continue;
					var startcoord2=m==startRidx?startViewCoord:r2[3];
					var stopcoord2=m==stopRidx?stopViewCoord:r2[4];
					if(k.stop>=startcoord2 && k.stop<=stopcoord2) {
						// valid pair
						var x1=this.cumoffset(i,k.start),
							x2=this.cumoffset(m,k.stop);
						if(x1>=0 && x2>x1) {
							tkobj.ld.hash[k.rs1]={rid:i,coord:k.start,topx:x1};
							tkobj.ld.hash[k.rs2]={rid:m,coord:k.stop,topx:x2};
						}
						break;
					}
				}
			}
		}
	}
	// 2. count and sort snp
	var lst=[];
	for(var x in tkobj.ld.hash) {
		var k=tkobj.ld.hash[x];
		lst.push([k.rid,k.coord,x]);
	}
	// doesn't matter if lst is empty?
	lst.sort(snpSort);
	/* 3. assign bottom xpos in the link graph
	*/
	var w=this.hmSpan/lst.length;
	for(var i=0; i<lst.length; i++) {
		var rs=lst[i][2];
		tkobj.ld.hash[rs].bottomx=w*(i+.5)-this.move.styleLeft;
	}
	var chr=this.genome.scaffold.current[0];
	/* hypothetical region, scale is consistant with this.entire
	*/
	var hy_r=[chr,0,this.genome.scaffold.len[chr],
		0, // dstart
		-1, // dstop
		this.entire.spnum, // width, region stretches widest
		null,
		-1, // summary size
		];
	if(this.entire.atbplevel) {
		hy_r[4]=(this.entire.spnum)/this.entire.bpwidth;
		// hy_r[7] not used
	} else {
		hy_r[7]=this.entire.summarySize;
		hy_r[4]=parseInt(this.entire.spnum*hy_r[7]);
	}

	this.decoy_dsp={
		regionLst:[hy_r],
		dspBoundary:{vstartr:0,vstarts:this.hmSpan,vstopr:0,vstops:this.hmSpan*2},
		bak_regionLst:this.regionLst,
		bak_dspBoundary:this.dspBoundary,
	};
	this.regionLst=this.decoy_dsp.regionLst;
	this.dspBoundary=this.decoy_dsp.dspBoundary;

	/* 4. make lr items that exist in the hypothetical region
	*/
	// window bp length
	if(this.entire.atbplevel) {
		w/=this.entire.bpwidth;
	} else {
		w*=hy_r[7];
	}
	var _data=[];
	for(i=startRidx; i<=stopRidx; i++) {
		for(j=0; j<tkobj.ld.data[i].length; j++) {
			var k=tkobj.ld.data[i][j];
			if((k.rs1 in tkobj.ld.hash) && (k.rs2 in tkobj.ld.hash)) {
				var a=tkobj.ld.hash[k.rs1].bottomx;
				var b=tkobj.ld.hash[k.rs2].bottomx;
				if(this.entire.atbplevel) {
					a/=this.entire.bpwidth;
					b/=this.entire.bpwidth;
				} else {
					a*=hy_r[7];
					b*=hy_r[7];
				}
				_data.push({id:k.id,
					start:parseInt(a-w/2),
					stop:parseInt(a+w/2),
					name:chr+':'+parseInt(b-w/2)+'-'+parseInt(b+w/2)+','+k.scorelst[tkobj.showscoreidx],
					strand:'>',
					});
			}
		}
	}
	tkobj.data=[_data];
	// all hypothetical!
	startRidx=stopRidx=0;
	if(this.entire.atbplevel) {
		startViewCoord=(-this.move.styleLeft)/this.entire.bpwidth;
		stopViewCoord=(this.hmSpan-this.move.styleLeft)/this.entire.bpwidth;
	} else {
		startViewCoord=(-this.move.styleLeft)*hy_r[7];
		stopViewCoord=(this.hmSpan-this.move.styleLeft)*hy_r[7];
	}
	startViewCoord=hy_r[3];
	stopViewCoord=hy_r[4];
	ft=FT_lr_c; // ld is pretending to be lr track
} else {
	// non-ld
	startRidx=this.dspBoundary.vstartr;
	startViewCoord=this.dspBoundary.vstartc;
	stopRidx=this.dspBoundary.vstopr;
	stopViewCoord=this.dspBoundary.vstopc;
}

var Data=[]; // stack data of all tracks
var Data2=[]; // only for arc or trihm

var isChiapet = (ft==FT_lr_n||ft==FT_lr_c);
var isSam = (ft==FT_sam_c||ft==FT_sam_n||ft==FT_bam_c||ft==FT_bam_n);
var drawTriheatmap = tkobj.mode==M_trihm;
var drawArc = tkobj.mode==M_arc;

/* both for arc and triangular heatmap:
if the on-canvas distance between two paired items is greater than hmSpan,
it will make the canvas too high, and the two items won't both show up
so limit it
*/

if(isSam) {
	/* bam/sam read pre-processing
	read alignment stop is not provided, figure out from cigar
	item.start/stop is for stacking only
	item.bam.start/stop is actual alignment
	*/
	for(var i=0; i<startRidx; i++) {
		Data.push(tkobj.data[i]);
	}
	var pairedReads={}; // key: read name, val: 1
	for(i=startRidx; i<=stopRidx; i++) {
		if(!tkobj.data[i] || tkobj.data[i].length==0) {
			Data.push([]);
			continue;
		}
		/* adjust read start/stop coord by clipping
		*/
		for(var j=0; j<tkobj.data[i].length; j++) {
			var item=tkobj.data[i][j];
			if(item.existbeforepan) {
				// when padding, existing data is ready and must escape recomputing
				continue;
			}
			setBamreadcoord(item);
		}
		tkobj.data[i].sort(gfSort_coord);
		var newarray=[];
		for(j=0; j<tkobj.data[i].length; j++) {
			var item=tkobj.data[i][j];
			var f=item.bam.flag;
			if(((f>>2)&1)==1) {
				// it is umapped?
				continue;
			}
			if(item.hasmate) {
				// already paired, perhaps before moving
				newarray.push(item);
				continue;
			}
			item.strand=(((f>>4)&1)==1)?'<':'>';
			if(((f>>0)&1)==1) {
				// paired
				if(item.id in pairedReads) continue;
				if(((f>>3)&1)==1) {
					// mate is unmapped
					item.bam.status='paired but mate is unmapped';
				} else {
					// mate is mapped
					var mateRidx=-1, // mate region idx
						mateDidx=-1; // mate data idx (in this region)
					// search in same region i
					for(var k=j+1; k<tkobj.data[i].length; k++) {
						if(tkobj.data[i][k].id==item.id) {
							mateRidx=i;
							mateDidx=k;
							break;
						}
					}
					if(mateRidx==-1) {
						// mate is not found in this region, look through the remainder
						for(var k=i+1; k<=stopRidx; k++) {
							if(mateRidx!=-1) break;
							for(var x=0; x<tkobj.data[k].length; x++) {
								if(tkobj.data[k][x].id==item.id) {
									mateRidx=k;
									mateDidx=x;
									break;
								}
							}
						}
					}
					if(mateRidx==-1) {
						item.bam.status='paired but mate is out of view range';
					} else {
						item.bam.status='paired';
						item.hasmate=true;
						pairedReads[item.id]=1;
						var mate=tkobj.data[mateRidx][mateDidx];
						if(mateRidx!=i) {
							if(mateRidx<i) fatalError('mateRidx<i');
							setBamreadcoord(mate);
						}
						var Li=i,
							Ri=mateRidx,
							L=item,
							R=mate;
							Ls=item.strand,
							Rs=(((f>>5)&1)==1)?'<':'>';
						if(mateRidx==i && mate.start<item.start) {
							// swap
							L=mate;
							R=item;
							var tt=Rs; Rs=Ls; Ls=tt;
						}
						item.struct={
							L:{rid:Li,start:L.start,stop:L.stop,strand:Ls,bam:L.bam},
							R:{rid:Ri,start:R.start,stop:R.stop,strand:Rs,bam:R.bam}};
					}
				}
			} else {
				// single
				item.bam.status='single';
			}
			newarray.push(item);
		}
		Data.push(newarray);
	}
	for(i=stopRidx+1; i<this.regionLst.length; i++) {
		Data.push(tkobj.data[i]);
	}
	tkobj.data=Data;
} else if(isChiapet) {
	/* long-range data pre-processing...
	a new Data object will be made containing:
	- complete pairs in displayed region that are joined
	- singletons
	*/
	Data = tkobj.data;
	var newdata = [];
	for(var i=0; i<startRidx; i++) {
		newdata.push([]);
	}

	/* "item" means the from-item
	"mate" means the to-item
	*/
	var usedItems={}; // key: "mate chr start stop", val: "item chr start stop"

	/* sorting must be enabled, though expensive
	because during panning, new data is appended to the .data
	and it won't draw anything if not sorted...
	*/
	for(i=startRidx; i<=stopRidx; i++) {
		Data[i].sort(gfSort_coord);
	}
	for(i=startRidx; i<=stopRidx; i++) {
		var itemchr=this.regionLst[i][0];
		newdata.push([]);
		for(var j=0; j<Data[i].length; j++) {
			var item = Data[i][j];

			/* skip items outside the view and to the left */
			if(i == startRidx) {
				if(item.stop<=startViewCoord) continue;
			}
			/* quit searching if outside the view and to the right */
			if(i == stopRidx) {
				if(item.start>=stopViewCoord) break;
			}

			/* skip items with incorrect name */
			if(item.name.indexOf(',')==-1) continue;
			var tmp=item.name.split(',');

			/* skip item if it has already been paired */
			var tmp3=itemchr+':'+item.start+'-'+item.stop;
			if(tmp3 in usedItems && usedItems[tmp3]==tmp[0]) continue;

			var score=tmp[1];

			var tmp2=this.genome.parseCoordinate(tmp[0],2);
			if(!tmp2) continue;
			var matechr = tmp2[0];
			var matestart = tmp2[1];
			var matestop = tmp2[3];

			var mateRegionidx=-1;
			if(matechr==itemchr && matestop<=this.regionLst[i][3]) {
				/* do nothing, item will be unpaired in this rare case
				when running gsv, the item at left side will have its mate at
				upstream outside of the region, such item shall be unpaired */
			} else {
				var distoncanvas = 0; // curb by distance on canvas
				for(var k=i; k<=stopRidx; k++) {
					// for each region, see if mate fits in
					if(distoncanvas>=this.hmSpan) break;
					if(this.regionLst[k][0]==matechr) {
						if(Math.max(this.regionLst[k][3],matestart) < Math.min(this.regionLst[k][4],matestop)) {
							mateRegionidx=k;
							usedItems[tmp[0]]=tmp3;
							break;
						}
					}
					// increment dist on canvas
					if(k==i) {
						distoncanvas += this.cumoffset(i,this.regionLst[i][4])-this.cumoffset(i,item.stop);
					} else {
						distoncanvas += this.cumoffset(k,this.regionLst[k][4])-this.cumoffset(k,this.regionLst[k][3]);
					}
				}
			}
			var newitem = {};
			if(mateRegionidx == -1) {
				// mate not found for this item
				if(!drawArc && !drawTriheatmap) {
					// save singleton for stack mode, but not arc or triheamap
					newitem.id = item.id;
					newitem.start = item.start;
					newitem.stop = item.stop;
					newitem.name = item.name;
					newitem.strand = item.strand;
					newitem.hasmate=false;
					newdata[i].push(newitem);
				}
			} else {
				var L, R;
				if(i < mateRegionidx) {
					// item and its mate in separate region
					L={rid:i,start:item.start,stop:item.stop};
					R={rid:mateRegionidx,start:matestart,stop:matestop};
				} else {
					// in same region
					if(item.start > matestart) {
						R={rid:i,start:item.start,stop:item.stop};
						L={rid:i,start:matestart,stop:matestop};
					} else {
						L={rid:i,start:item.start,stop:item.stop};
						R={rid:i,start:matestart,stop:matestop};
					}
				}
				// i can never be bigger than mateRegionidx...
				newitem.id = item.id;
				newitem.start = L.start;
				newitem.stop = R.stop;
				newitem.name = parseFloat(score);
				newitem.struct = {L:L,R:R};
				newitem.hasmate = true;
				newdata[i].push(newitem);
			}
		}
	}
	if(drawArc || drawTriheatmap) {
		Data2 = newdata;
	} else {
		Data2 = null;
		Data = newdata;
	}
	tkobj.data_chiapet = newdata; // attach for clicking on canvas
} else {
	Data = tkobj.data;
	Data2 = null;
}

/* convert item coord into box start/width 
only do for items within lws and rws
those fit in will have valid .boxstart/boxwidth computed,
else they will be left undefined
serve as a way to quickly tell if to process this item later

in case of paired read or long-range interaction,
start coord will be start of query,
stop coord will be stop of mate,
must detect if query/mate are in *separate* regions
*/
var longrangemaxspan = 0; // for both arcs and triheatmap, to determine/curb canvas height
if(isSam) {
	/* sam reads, use Data
	*/
	for(var i=startRidx; i<=stopRidx; i++) {
		if(!Data[i]) continue;
		var r = this.regionLst[i];
		var fvd= (r[8] && r[8].item.hsp.strand=='-')?false:true;
		for(var j=0; j<Data[i].length; j++) {
			var item = Data[i][j];
			item.stack = undefined; // by default
			if(item.hasmate) {
				// two reads might be in *separate* regions
				var materid=item.struct.R.rid;
				if(materid==i) {
					var a=Math.max(r[3],Math.min(item.struct.L.start,item.struct.R.start)),
						b=Math.min(r[4],Math.max(item.struct.L.stop,item.struct.R.stop));
					if(fvd) {
						item.boxstart=this.cumoffset(i,a);
						item.boxwidth=this.cumoffset(i,b)-item.boxstart;
					} else {
						item.boxstart=this.cumoffset(i,b);
						item.boxwidth=this.cumoffset(i,a)-item.boxstart;
					}
				} else {
					// materid is sure to be bigger than i
					item.boxstart = this.cumoffset(i, 
						fvd? Math.max(item.start,r[3]) : Math.min(item.stop,r[4]) );
					var r2=this.regionLst[materid];
					var fvd2=(r2[8] && r2[8].item.hsp.strand=='-')?false:true;
					item.boxwidth = this.cumoffset(materid,
						(fvd2 ? Math.min(item.struct.R.stop,r2[4]) :
							Math.max(item.struct.R.start,r2[3]))
						) - item.boxstart;
				}
			} else {
				item.boxstart = this.cumoffset(i, 
					fvd? Math.max(item.start,r[3]) : Math.min(item.stop,r[4]) );
				item.boxwidth = Math.max(1,
					this.cumoffset(i, fvd? Math.min(item.stop,r[4]) : Math.max(item.start,r[3]))
					-item.boxstart);
			}
		}
	}
} else if(drawArc || drawTriheatmap) {
	/* long-range data,
	do it for Data2, set longrangemaxspan here */
	for(var i=startRidx; i<=stopRidx; i++) {
		var r = this.regionLst[i];
		var rstart = r[3]; // region start coord
		var rstop = r[4]; // region stop coord
		for(var j=0; j<Data2[i].length; j++) {
			var item = Data2[i][j];
			item.stack = undefined; // stack is not used in arc or trihm
			if(item.hasmate) {
				/** item's mate might be in *separate* regions **/
				item.boxstart = this.cumoffset(i,Math.max(item.start,r[3]));
				var materid = item.struct.R.rid;
				for(var k=i; k<=stopRidx; k++) {
					var rr = this.regionLst[k];
					if(k == materid) {
						var istop=Math.min(item.stop,rr[4]);
						item.boxwidth = this.cumoffset(k,Math.min(item.stop,rr[4])) - item.boxstart;
						/* dirty filter, to restrict track height */
						if(item.boxwidth>this.hmSpan) {
							item.boxstart=item.boxwidth=undefined;
						}
						break;
					}
				}
				// however, item stop coord might be beyond this region, so just skip it?
				if(item.boxwidth != undefined) {
					longrangemaxspan=Math.max(longrangemaxspan, item.boxwidth);
				}
			} else {
				/* unpaired item
				TODO plot a mark on canvas
				*/
				item.boxstart=item.boxwidth=undefined;
			}
		}
	}
} else if(tkobj.ft==FT_weaver_c && tkobj.weaver.mode==W_rough) {
	// do not compute boxstart
	this.weaver_stitch(tkobj);
} else {
	/* stack-style or barplot
	*/
	for(var i=startRidx; i<=stopRidx; i++) {
		var r = this.regionLst[i];
		var fvd= (r[8] && r[8].item.hsp.strand=='-')?false:true;
		for(var j=0; j<Data[i].length; j++) {
			var item = Data[i][j];
			item.stack = undefined; // by default
			item.boxstart = this.cumoffset(i,
				fvd? Math.max(item.start,r[3]) : Math.min(item.stop,r[4]) );
			if(isChiapet && item.hasmate) {
				// assume start point must be in this region? check using item start
				/** mate might be in *separate* regions **/
				var materid = item.struct.R.rid;
				var rr = this.regionLst[materid];
				a=Math.min(item.stop,rr[4]);
				// TODO fvd?
				item.boxwidth = this.cumoffset(materid,Math.min(item.stop,rr[4])) - item.boxstart;
			} else {
				item.boxwidth = Math.max(1, this.cumoffset(i,
					(fvd ? Math.min(item.stop,r[4]) : Math.max(item.start,r[3])))
					-item.boxstart);
			}
		}
	}
}

// TODO tkobj.qtc.stackheight come on...
var isThin = tkobj.mode==M_thin;
var stackHeight = tkobj.qtc.stackheight ? tkobj.qtc.stackheight : (isThin ? thinStackHeight : fullStackHeight);

var viewstart_px=-this.move.styleLeft;
var viewstop_px=viewstart_px+this.hmSpan;
var maxstack=0;

/* set track canvas height */
if(drawArc || drawTriheatmap) {
	if(tkobj.ft==FT_ld_c || tkobj.ft==FT_ld_n) {
		canvas.height = parseInt(longrangemaxspan*Math.tan(Math.PI*tkobj.qtc.anglescale/4)/2)+2+yoffset+tkobj.ld.ticksize+tkobj.ld.topheight;
	} else if(drawArc && longrangemaxspan>0) {
		canvas.height = Math.max(10, longrangemaxspan*((1/Math.SQRT2) - 0.5)+2+yoffset);
	} else if(drawTriheatmap && longrangemaxspan>0) {
		canvas.height = Math.min(this.hmSpan/2, parseInt(longrangemaxspan*Math.tan(Math.PI*tkobj.qtc.anglescale/4)/2)+2+yoffset);
	} else {
		canvas.height = 10;
	}
} else if(tkobj.ft==FT_weaver_c && tkobj.weaver.mode==W_rough) {
	// rough weaver, no stacking
	canvas.height = tkobj.qtc.height+fullStackHeight;
	// may adjust to ..
} else if(tkobj.mode==M_bar || tkobj.ft==FT_weaver_c) {
	/* duplicative
	barplot or weaver, do stacking only by item coord, but not boxstart/stop, and not including name
	*/
	var stack=[], // coord
		stackcanvas=[]; // on canvas x
	for(i=startRidx; i<=stopRidx; i++) {
		if(Data[i]==undefined) {
			continue;
		}
		var r=this.regionLst[i];
		var fvd= (r[8] && r[8].item.hsp.strand=='-') ? false : true;
		if(fvd) {
			Data[i].sort(gfSort_coord);
		} else {
			Data[i].sort(gfSort_coord_rev);
		}
		//var max_x=0;
		for(var j=0; j<Data[i].length; j++) {
			var item = Data[i][j];
			if(item.boxstart==undefined || item.boxwidth==undefined) continue;
			item.namestart=undefined;
			var sid=0;
			
			if(j>0) {
				if(fvd) {
					while(stack[sid]>item.start) sid++;
				} else {
					while(stack[sid]<item.start) sid++;
				}
			}
			if(stack[sid]==undefined) {
				stack[sid]=stackcanvas[sid]=-1;
			}

			var _iN=item.name2?item.name2:item.name;
			var ivr=Math.max(viewstart_px,item.boxstart)<Math.min(viewstop_px,item.boxstart+item.boxwidth);
			if(_iN && ivr) {
				// only deals with name if box overlaps with view range
				item.namewidth = ctx.measureText(_iN).width;
				if(item.struct || item.namewidth>=item.boxwidth) {
					// try to put name outside
					if(item.namewidth<=item.boxstart-stackcanvas[sid]-2) {
						item.namestart=item.boxstart-item.namewidth-1;
					}
				} else {
					item.namestart=item.boxstart+(item.boxwidth-item.namewidth)/2;
				}
			}

			stack[sid]=item.stop;
			stackcanvas[sid]=item.boxstart+item.boxwidth;
			item.stack=sid;
			/* not used, to decide if an item overlaps with another
			item.__overlap= item.start<max_x;
			max_x=Math.max(max_x,item.stop);
			*/
			if(ivr && maxstack<sid) {
				maxstack = sid;
			}
		}
		// must clear stack as coord will be different in another region
		stack=[-1];
	}
	if(tkobj.ft==FT_weaver_c) {
		canvas.height = (stackHeight+1) * (maxstack+1) + yoffset + weavertkpad*2+
			(tkobj.weaver.mode==W_fine?weavertk_hspdist_strpad+weavertk_hspdist_strh:0);
	} else {
		canvas.height=densitydecorpaddingtop+tkobj.qtc.height+1+(fullStackHeight+1)*(maxstack+1);
	}
} else {
	/*** 
		tk stack

	in thin mode, allow items sit right next to each other in one stack
	in full mode:
		1px spacing between items in same stack
		determine whether to draw name
		if draw, decide namestart

	for each region between left/right wing:
	for each bed item:
		define stack start/width by full/thin, if item has name, name width, ...
		try stacking item
		if successfully stacked:
			set stack id
		else:
			left stack id unspecified
	don't cap number of items plotted in JS, that's capped in C
	TODO bam reads must be capped in C, so that excessive data won't be passed to client
	***/
	/* to properly set canvas height,
	need to count max stack # within [dspBoundary.vstarts, dspBoundary.vstops]
	but need to know pixel position of .vstarts and .vstops
	*/
	// need to set font here to measure text width
	if(tkobj.qtc) {
		ctx.font = (tkobj.qtc.fontbold?'bold':'')+' '+
			(tkobj.qtc.fontsize?tkobj.qtc.fontsize:'8pt')+' '+
			(tkobj.qtc.fontfamily?tkobj.qtc.fontfamily:'sans-serif');
	}
	var stack = [-1000];
	for(i=startRidx; i<=stopRidx; i++) {
		if(Data[i]==undefined) {
			continue;
		}
		/* to enable sorting using score, need to tell gfSort the score index being used
		do not risk of appending that to gflag, it won't guard against paralelle rendering
		need to append scoreidx to each item
		*/
		if(tkobj.showscoreidx!=undefined) {
			for(var j=0; j<Data[i].length; j++) {
				Data[i][j].__showscoreidx=tkobj.showscoreidx;
			}
		}
		Data[i].sort(gfSort);
		if(tkobj.showscoreidx!=undefined) {
			for(var j=0; j<Data[i].length; j++) {
				delete Data[i][j].__showscoreidx;
			}
		}
		for(var j=0; j<Data[i].length; j++) {
			var item = Data[i][j];
			if(item.boxstart==undefined) {
				// filtered by score !
				continue;
			}
			item.stack = undefined; // by default
			// make stack start/width for stacking
			var k = 0; // stack id iterator
			item.stackstart = item.boxstart;
			item.stackwidth = item.boxwidth;
			item.namestart=undefined;
			if(isThin) { // thin
				while(stack[k] > item.stackstart) {
					k++;
					if(k == stack.length) stack.push(-1000);
				}
			} else { // full
				var _iN=item.name2?item.name2:item.name;
				if(_iN && (Math.max(0-this.move.styleLeft,item.boxstart)<Math.min(this.hmSpan-this.move.styleLeft,item.boxstart+item.boxwidth))) {
					// only deals with name if box overlaps with view range
					item.namewidth = ctx.measureText(_iN).width;
					if(item.struct || item.namewidth>=item.boxwidth) {
						// try to put name outside
						if(item.boxstart<=0-this.move.styleLeft) {
							// left end out
							if(item.boxstart+item.boxwidth+item.namewidth>this.hmSpan-this.move.styleLeft) {
								// name forced into box
								item.namestart=10-this.move.styleLeft;
							} else {
								// name on the right
								item.namestart=item.boxstart+item.boxwidth+1;
								item.stackwidth=item.boxwidth+item.namewidth+1;
							}
						} else {
							if(item.boxstart+this.move.styleLeft<item.namewidth) {
								// not enough space on left
								if(item.boxstart+item.boxwidth+item.namewidth>this.hmSpan-this.move.styleLeft) {
									// name forced into box
									item.namestart=item.boxstart+10;
								} else {
									// on right
									item.namestart=item.boxstart+item.boxwidth+1;
									item.stackwidth=item.boxwidth+item.namewidth+1;
								}
							} else {
								// on left
								item.namestart=item.boxstart-item.namewidth-1;
								item.stackstart=item.namestart;
								item.stackwidth=item.boxwidth+item.namewidth+1;
							}
						}
					} else {
						// name fits into box
						item.stackstart = item.boxstart;
						item.stackwidth = item.boxwidth;
						item.namestart=item.boxstart+(item.boxwidth-item.namewidth)/2;
					}
				}
				// need items in same stack to have one pixel spacing,
				while(stack[k]+1 > item.stackstart) {
					k++;
					//if(k == stackNumberLimit) break;
					// big negative value help process items with 0 or negative box start
					if(k == stack.length) stack.push(-10000);
				}
			}
			// this item is stacked
			stack[k] = item.stackstart+item.stackwidth+1;
			item.stack = k;
			if((Math.max(viewstart_px, item.boxstart) < Math.min(viewstop_px, item.boxstart+item.boxwidth)) && maxstack<k) {
				maxstack = k;
			}
		}
	}
	canvas.height = Math.max(10, (stackHeight+1) * (maxstack+1) + yoffset);
}
if(tkobj.ft==FT_ld_c||tkobj.ft==FT_ld_n) {
	this.regionLst=this.decoy_dsp.bak_regionLst;
	this.dspBoundary=this.decoy_dsp.bak_dspBoundary;
}
}


function setBamreadcoord(item)
{
var c=item.bam.cigar;
item.stop=item.bam.start=item.bam.stop=item.start; // position of aligned portion
if(c.length==0) {
	item.stop= item.bam.stop= item.start+item.bam.seq.length;
} else {
	if(c[0][0]=='S') { // move start to left if soft clip on left
		item.start-=c[0][1];
	}
	// compute stop
	for(var k=0; k<c.length; k++) {
		var op=c[k][0];
		var cl=c[k][1];
		item.stop+=cl;
		if(op=='M'||op=='D'||op=='N') {
			item.bam.stop+=cl;
		}
	}
}
}


Browser.prototype.region2showpos=function(c)
{
// arg: ['chr',111,222], might hit at multiple locations!!
if(typeof(c)=='string') {
	var lst=this.genome.parseCoordinate(c,2);
	if(!lst) {
		return null;
	}
	c=lst;
} else if(c.length!=3) {
	print2console('region2showpos: wrong input',2);
	return null;
}
var hits=[];
for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	if(r[0]==c[0]) {
		var x=this.cumoffset(i,c[1]);
		if(x) {
			hits.push([ x, this.bp2sw(i,Math.min(c[2],r[4])-Math.max(c[1],r[3]))]);
		}
	}
}
if(hits.length==0) return null;
return hits;
}

Browser.prototype.drawRuler_browser=function(tosvg)
{
/* ruler bar above genome heatmap, height is fixed
*/
if(!this.rulercanvas) return [];
this.rulercanvas.width=this.entire.spnum;
this.rulercanvas.height=20;
var ctx = this.rulercanvas.getContext('2d');
var h=this.rulercanvas.height;

if(this.highlight_regions.length>0) {
	var cl=colorCentral.hl;
	for(var j=0; j<this.highlight_regions.length; j++) {
		var lst=this.region2showpos(this.highlight_regions[j]);
		if(!lst) continue;
		for(var i=0; i<lst.length; i++) {
			var p=lst[i];
			if(!p[1]) continue;
			ctx.fillStyle=cl;
			ctx.fillRect(p[0],0,p[1],h-1);
			// always make a mark
			var center=p[0]+p[1]/2;
			ctx.beginPath();
			ctx.moveTo(center-8,0);
			ctx.lineTo(center+8,0);
			ctx.lineTo(center,h-1);
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle=cl;
			ctx.fillRect(p[0],h-3,p[1],2);
		}
	}
}
if(this.is_gsv()){
	// only draw hollow boxes in one row
	ctx.fillStyle=colorCentral.foreground_faint_5;
	for(var i=0; i<this.regionLst.length; i++) {
		var x= this.cumoffset(i,this.regionLst[i][4],true);
		ctx.fillRect(x, 0, 1, h);
	}
	return [];
}
var previousplotstop = 0;
var svgdata=[];
ctx.lineWidth=1;
var y=h-3.5;
ctx.strokeStyle=ctx.fillStyle=colorCentral.foreground_faint_5;
ctx.beginPath();
var pastx=0;
for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	// mark region boundary
	var x1=parseInt(this.cumoffset(i,r[3]))+.5;
	var svgx=x1;
	ctx.moveTo(x1,y-1.5);
	ctx.lineTo(x1,y+1.5);
	if(tosvg) svgdata.push({type:svgt_line,x1:x1,y1:y-1.5,x2:x1,y2:y+1.5});
	ctx.moveTo(x1,y);
	var incarr=this.weaver_gotgap(i);
	if(incarr) {
		for(var j=0; j<incarr.length; j++) {
			var x2=this.cumoffset(i,incarr[j]);
			ctx.lineTo(x2,y);
			if(tosvg) svgdata.push({type:svgt_line,x1:svgx,y1:y,x2:x2,y2:y});
			var gw=this.bp2sw(i,this.weaver.insert[i][incarr[j]]);
			if(gw>=1) {
				// mark gap
				var a=parseInt(x2)+.5;
				ctx.moveTo(a,y-4);
				ctx.lineTo(a,y+4);
				if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:y-2,x2:a,y2:y+2});
				a=parseInt(x2+gw)+.5;
				ctx.moveTo(a,y-4);
				ctx.lineTo(a,y+4);
				if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:y-2,x2:a,y2:y+2});
			}
			ctx.moveTo(x2+gw,y);
			svgx=x2+gw;
		}
	}
	var x2=parseInt(this.cumoffset(i,r[4],true))-.5;
	ctx.lineTo(x2,y);
	if(tosvg) svgdata.push({type:svgt_line,x1:svgx,y1:y,x2:x2,y2:y});
	ctx.moveTo(x2,y-1.5);
	ctx.lineTo(x2,y+1.5);
	if(tosvg) svgdata.push({type:svgt_line,x1:x2,y1:y-1.5,x2:x2,y2:y+1.5});

	// bp span within the on screen width of a region
	var bpspan=r[4]-r[3];
	var plotwidth=this.bp2sw(i,bpspan);
	var u=Math.pow(10,10);
	while(u>bpspan/(plotwidth/100)) {
		u/=10;
	}
	for(var j=Math.ceil(r[3]/u); j<=Math.floor(r[4]/u); j++) {
		var v=u*j; // coord
		var x=this.cumoffset(i,v,true)+.5;
		var w=ctx.measureText(v).width;
		if(w/2+10 <= x-pastx) {
			ctx.fillText(v,x-w/2,10);
			if(tosvg) svgdata.push({type:svgt_text,x:x-w/2,y:10,text:v});
			ctx.moveTo(parseInt(x)+.5,12);
			ctx.lineTo(parseInt(x)+.5,h-3);
			if(tosvg) svgdata.push({type:svgt_line,x1:x,y1:12,x2:x,y2:h-3});
			pastx=x+w/2;
		} else {
			ctx.moveTo(parseInt(x)+.5,14);
			ctx.lineTo(parseInt(x)+.5,h-3);
			if(tosvg) svgdata.push({type:svgt_line,x1:x,y1:15,x2:x,y2:h-3});
		}
	}
}
ctx.stroke();
if(tosvg) return svgdata;
}





Browser.prototype.synctkh_padding=function(tkname)
{
// should be calling from trunk
var tkobj=this.findTrack(tkname);
var maxH=tkobj.canvas.height;
for(var tag in this.splinters) {
	var b=this.splinters[tag];
	var o=b.findTrack(tkname);
	/* in case of splinting
	unfinished chip is inserted into trunk.splinters
	and resizing trunk will re-draw all tracks in trunk
	but the splinter tracks are not ready
	*/
	if(o) {
		maxH=Math.max(o.canvas.height,maxH);
	}
}
// apply padding to trunk track
var _p= maxH-tkobj.canvas.height;
tkobj.canvas.style.paddingBottom=_p;
if(this.hmheaderdiv) {
	tkobj.header.style.paddingBottom=_p;
}
if(this.mcm) {
	tkobj.atC.style.paddingBottom=_p;
}
this.trackHeightChanged();
// apply to each splinter
for(tag in this.splinters) {
	var b=this.splinters[tag];
	var o=b.findTrack(tkobj.name);
	if(o) {
		o.canvas.style.paddingBottom=maxH-o.canvas.height;
		b.trackHeightChanged();
	}
}
}

function menu_update_track(updatecontext)
{
/* splinter tk no longer shares qtc with trunk tk
all style changes are applied on trunk
and must be copied to splinter, what a labor
calling drawTrack_browser(trunk_tk) will automatically redraw splinter
*/
var bbj=gflag.menu.bbj;
switch(gflag.menu.context) {
case 1:
case 2:
	// always switch to trunk
	if(bbj.splinterTag) {
		bbj=bbj.trunk;
	}
	var _lst=bbj.tklstfrommenu();
	var A=false, // will re-issue ajax
		A_tklst=[];
	var groupScaleChange=[]; // array idx is group idx, ele: {scale: min: max:}
	var takelog=false;
	for(var i=0; i<_lst.length; i++) {
		// just in case it's splinter's tk
		var tk=bbj.findTrack(_lst[i].name);
		if(!tk || tk.mastertk) {
			continue;
		}
		var tkreg=bbj.genome.getTkregistryobj(tk.name);
		if(!tkreg) {
			print2console('registry object not found: '+tk.label,2);
		}
		// when changing y scale, need to tell if is numerical, apart from isNumerical also if using score
		var useScore= (tk.showscoreidx!=undefined && tk.showscoreidx>=0);
		var U=false, // re-rendering
			M=false, // update config menu on tk
			H=false; // tk height changed
		switch(updatecontext) {
		case 1:
			var c=menu.c50.color1.style.backgroundColor;
			if(isNumerical(tk)) {
				var x=colorstr2int(c);
				tk.qtc.pr=x[0];
				tk.qtc.pg=x[1];
				tk.qtc.pb=x[2];
				tkreg.qtc.pr=x[0];
				tkreg.qtc.pg=x[1];
				tkreg.qtc.pb=x[2];
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.pr=x[0];
					tk2.qtc.pg=x[1];
					tk2.qtc.pb=x[2];
				}
				U=true;
			}
			break;
		case 2:
			var c=menu.c50.color2.style.backgroundColor;
			if(isNumerical(tk)) {
				var x=colorstr2int(c);
				tk.qtc.nr=x[0];
				tk.qtc.ng=x[1];
				tk.qtc.nb=x[2];
				tkreg.qtc.nr=x[0];
				tkreg.qtc.ng=x[1];
				tkreg.qtc.nb=x[2];
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.nr=x[0];
					tk2.qtc.ng=x[1];
					tk2.qtc.nb=x[2];
				}
				U=true;
			}
			break;
		case 3:
			if(isNumerical(tk)) {
				tk.qtc.pth=menu.c50.color1_1.style.backgroundColor;
				tkreg.qtc.pth=tk.qtc.pth;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.pth=tk.qtc.pth;
				}
				U=true;
			}
			break;
		case 4:
			if(isNumerical(tk)) {
				tk.qtc.nth=menu.c50.color2_1.style.backgroundColor;
				tkreg.qtc.nth=tk.qtc.nth;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.nth=tk.qtc.nth;
				}
				U=true;
			}
			break;
		case 5:
			var v=parseInt(menu.c51.select.options[menu.c51.select.selectedIndex].value);
			// should not be scale_fix
			if(isNumerical(tk) || tk.ft==FT_matplot) {
				tk.qtc.thtype=v;
				tkreg.qtc.thtype=v;
				if(v==scale_percentile) {
					tk.qtc.thpercentile=parseInt(menu.c51.percentile.says.innerHTML);
					tkreg.qtc.thpercentile=tk.qtc.thpercentile;
				}
				qtc_thresholdcolorcell(tk.qtc);
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.thtype=v;
					if(v==scale_percentile) {
						tk2.qtc.thpercentile=tk.qtc.thpercentile;
					}
				}
				U=true;
				if(tk.group!=undefined) {
					groupScaleChange[tk.group]={scale:scale_auto};
				}
			} else if(useScore) {
				// "Apply to all" spilling over
				// no matter if auto or percentile, force to auto
				tk.scorescalelst[tk.showscoreidx].type=scale_auto;
				tkreg.scorescalelst[tk.showscoreidx].type=scale_auto;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.scorescalelst[tk.showscoreidx].type=scale_auto;
				}
				U=true;
				if(tk.group!=undefined) {
					groupScaleChange[tk.group]={scale:scale_auto};
				}
			}
			break;
		case 6:
			if(isNumerical(tk) || tk.ft==FT_matplot) {
				tk.qtc.thtype=scale_fix;
				tk.qtc.thmin=parseFloat(menu.c51.fix.min.value);
				tk.qtc.thmax=parseFloat(menu.c51.fix.max.value);
				tkreg.qtc.thtype=tk.qtc.thtype;
				tkreg.qtc.thmin=tk.qtc.thmin;
				tkreg.qtc.thmax=tk.qtc.thmax;
				qtc_thresholdcolorcell(tk.qtc);
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.thtype=scale_fix;
					tk2.qtc.thmin=tk.qtc.thmin;
					tk2.qtc.thmax=tk.qtc.thmax;
				}
				U=true;
				if(tk.group!=undefined) {
					groupScaleChange[tk.group]={scale:scale_fix, min:tk.qtc.thmin, max:tk.qtc.thmax};
				}
			} else if(useScore) {
				// "Apply to all" spilling over
				var scale=tk.scorescalelst[tk.showscoreidx];
				scale.type=scale_fix;
				scale.min=parseFloat(menu.c51.fix.min.value);
				scale.max=parseFloat(menu.c51.fix.max.value);
				var s2=tk.scorescalelst[tk.showscoreidx];
				s2.type=scale_fix;
				s2.min=scale.min;
				s2.max=scale.max;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					s2=tk2.scorescalelst[tk.showscoreidx];
					s2.type=scale_fix;
					s2.min=scale.min;
					s2.max=scale.max;
				}
				U=true;
				if(tk.group!=undefined) {
					groupScaleChange[tk.group]={scale:scale_fix, min:scale.min, max:scale.max};
				}
			}
			break;
		case 7:
			if(isNumerical(tk) || tk.ft==FT_matplot) {
				tk.qtc.thtype=scale_percentile;
				tk.qtc.thpercentile=parseInt(menu.c51.percentile.says.innerHTML);
				tkreg.qtc.thtype=tk.qtc.thtype;
				tkreg.qtc.thpercentile=tk.qtc.thpercentile;
				qtc_thresholdcolorcell(tk.qtc);
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.thtype=scale_percentile;
					tk2.qtc.thpercentile=tk.qtc.thpercentile;
				}
				U=true;
				if(tk.group!=undefined) {
					// but is forced to auto for group
					groupScaleChange[tk.group]={scale:scale_auto};
				}
			} else if(useScore) {
				// "Apply to all" spilling over
				tk.scorescalelst[tk.showscoreidx].type=scale_auto;
				tkreg.scorescalelst[tk.showscoreidx].type=scale_auto;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.scorescalelst[tk.showscoreidx].type=scale_auto;
				}
				U=true;
				if(tk.group!=undefined) {
					groupScaleChange[tk.group]={scale:scale_auto};
				}
			}
			break;
		case 8:
			var windowsize=parseInt(menu.c46.says.innerHTML);
			if(isNumerical(tk)) {
				if(menu.c46.checkbox.checked) {
					// apply smoothing, no matter whether it is already smoothed or not
					tk.qtc.smooth=windowsize;
					tkreg.qtc.smooth=windowsize;
					if(!tk.data_raw) {
						tk.data_raw=tk.data;
					}
					for(var a in bbj.splinters) {
						var tk2=bbj.splinters[a].findTrack(tk.name);
						if(!tk2) continue;
						tk2.qtc.smooth=windowsize;
						if(!tk2.data_raw) {
							tk2.data_raw=tk2.data;
						}
					}
					U=true;
				} else {
					// remove smoothing effect
					if(tk.qtc.smooth) {
						tk.qtc.smooth=undefined;
						tkreg.qtc.smooth=undefined;
						tk.data=tk.data_raw;
						delete tk.data_raw;
						for(var a in bbj.splinters) {
							var tk2=bbj.splinters[a].findTrack(tk.name);
							if(!tk2) continue;
							tk2.qtc.smooth=undefined;
							tk2.data=tk2.data_raw;
							delete tk2.data_raw;
						}
						U=true;
					}
				}
			} else if(tk.ft==FT_cm_c) {
				var rdf=tk.cm.set.rd_f;
				var rdr=tk.cm.set.rd_r;
				if(!rdf) continue;
				if(menu.c46.checkbox.checked) {
					// apply for cmtk
					rdf.qtc.smooth=windowsize;
					var _reg=bbj.genome.getTkregistryobj(rdf.name);
					if(!_reg) fatalError('regobj missing for forward read depth');
					_reg.qtc.smooth=windowsize;
					if(rdr) {
						rdr.qtc.smooth=windowsize;
						var _reg=bbj.genome.getTkregistryobj(rdr.name);
						if(!_reg) fatalError('regobj missing for reverse read depth');
						_reg.qtc.smooth=windowsize;
					}
					if(!rdf.data_raw) {
						rdf.data_raw=rdf.data;
						if(rdr) {
							rdr.data_raw=rdr.data;
						}
					}
					for(var a in bbj.splinters) {
						var tk2=bbj.splinters[a].findTrack(tk.name);
						if(!tk2) continue;
						rdf=tk2.cm.set.rd_f;
						rdr=tk2.cm.set.rd_r;
						rdf.qtc.smooth=windowsize;
						if(rdr) {
							rdr.qtc.smooth=windowsize;
						}
						if(!rdf.data_raw) {
							rdf.data_raw=rdf.data;
							if(rdr) {
								rdr.data_raw=rdr.data;
							}
						}
					}
					U=true;
				} else {
					// cmtk cancel
					if(!rdf.qtc.smooth) continue;
					rdf.qtc.smooth=undefined;
					rdf.data=rdf.data_raw;
					delete rdf.data_raw;
					var _reg=bbj.genome.getTkregistryobj(rdf.name);
					if(!_reg) fatalError('regobj missing for forward read depth');
					_reg.qtc.smooth=undefined;
					if(rdr) {
						rdr.qtc.smooth=undefined;
						rdr.data=rdr.data_raw;
						delete rdr.data_raw;
						var _reg=bbj.genome.getTkregistryobj(rdr.name);
						if(!_reg) fatalError('regobj missing for reverse read depth');
						_reg.qtc.smooth=undefined;
					}
					for(var a in bbj.splinters) {
						var tk2=bbj.splinters[a].findTrack(tk.name);
						if(!tk2) continue;
						rdf=tk2.cm.set.rd_f;
						rdr=tk2.cm.set.rd_r;
						rdf.qtc.smooth=undefined;
						rdf.data=rdf.data_raw;
						delete rdf.data_raw;
						if(rdr) {
							rdr.qtc.smooth=undefined;
							rdr.data=rdr.data_raw;
							delete rdr.data_raw;
						}
					}
					U=true;
				}
			} else if(tk.ft==FT_matplot) {
				print2console('matplot smoothing not available yet',2);
			}
			break;
		case 9:
			if(isNumerical(tk)) {
				tk.qtc.logtype=parseInt(menu.c52.select.options[menu.c52.select.selectedIndex].value);
				tkreg.qtc.logtype=tk.qtc.logtype;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.logtype=tk.qtc.logtype;
				}
				U=true;
				takelog=true;
			}
			break;
		case 10:
			if(tk.qtc.bedcolor) {
				tk.qtc.bedcolor=menu.bed.color.style.backgroundColor;
				if(!tkreg.qtc) tkreg.qtc={};
				tkreg.qtc.bedcolor=tk.qtc.bedcolor;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.bedcolor=tk.qtc.bedcolor;
				}
				U=true;
			}
			break;
		case 11:
			if(tk.qtc.textcolor) {
				tk.qtc.textcolor=menu.font.color.style.backgroundColor;
				if(!tkreg.qtc) tkreg.qtc={};
				tkreg.qtc.textcolor=tk.qtc.textcolor;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.textcolor=tk.qtc.textcolor;
				}
				U=true;
			}
			break;
		case 12:
			if(tk.qtc.fontfamily) {
				var s=menu.font.family;
				tk.qtc.fontfamily=s.options[s.selectedIndex].value;
				if(!tkreg.qtc) tkreg.qtc={};
				tkreg.qtc.fontfamily=tk.qtc.fontfamily;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.fontfamily=tk.qtc.fontfamily;
				}
				U=true;
			}
			break;
		case 13:
			if(tk.qtc.fontbold!=undefined) {
				tk.qtc.fontbold=menu.font.bold.checked;
				if(!tkreg.qtc) tkreg.qtc={};
				tkreg.qtc.fontbold=tk.qtc.fontbold;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.fontbold=tk.qtc.fontbold;
				}
				U=true;
			}
			break;
		case 14:
			if(tk.qtc.fontsize) {
				var s=parseInt(tk.qtc.fontsize);
				s+=menu.font.sizeincrease?1:-1;
				if(s<=5) s=5;
				tk.qtc.fontsize=s+'pt';
				if(!tkreg.qtc) tkreg.qtc={};
				tkreg.qtc.fontsize=tk.qtc.fontsize;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.fontsize=tk.qtc.fontsize;
				}
				U=true;
			}
			break;
		case 15:
			if(tk.qtc.forwardcolor) {
				tk.qtc.forwardcolor=menu.bam.f.style.backgroundColor;
				if(!tkreg.qtc) tkreg.qtc={};
				tkreg.qtc.forwardcolor=tk.qtc.forwardcolor;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.forwardcolor=tk.qtc.forwardcolor;
				}
				U=true;
			}
			break;
		case 16:
			if(tk.qtc.reversecolor) {
				tk.qtc.reversecolor=menu.bam.r.style.backgroundColor;
				if(!tkreg.qtc) tkreg.qtc={};
				tkreg.qtc.reversecolor=tk.qtc.reversecolor;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.reversecolor=tk.qtc.reversecolor;
				}
				U=true;
			}
			break;
		case 17:
			if(tk.qtc.mismatchcolor) {
				tk.qtc.mismatchcolor=menu.bam.m.style.backgroundColor;
				if(!tkreg.qtc) tkreg.qtc={};
				tkreg.qtc.mismatchcolor=tk.qtc.mismatchcolor;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.mismatchcolor=tk.qtc.mismatchcolor;
				}
				U=true;
			}
			break;
		case 18:
			if(tk.qtc.thtype!=undefined) {
				tk.qtc.thtype=menu.lr.autoscale.checked?scale_auto:scale_fix;
				tkreg.qtc.thtype=tk.qtc.thtype;
				if(menu.lr.autoscale.checked) {
					menu.lr.pcscoresays.innerHTML=
					menu.lr.ncscoresays.innerHTML='auto';
				} else {
					menu.lr.pcscore.value=tk.qtc.pcolorscore;
					menu.lr.ncscore.value=tk.qtc.ncolorscore;
				}
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.thtype=tk.qtc.thtype;
				}
				U=true;
			}
			break;
		case 19:
			if(tk.ft==FT_lr_n||tk.ft==FT_lr_c) {
				var c=colorstr2int(menu.lr.pcolor.style.backgroundColor);
				tk.qtc.pr=c[0];
				tk.qtc.pg=c[1];
				tk.qtc.pb=c[2];
				tkreg.qtc.pr=c[0];
				tkreg.qtc.pg=c[1];
				tkreg.qtc.pb=c[2];
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.pr=c[0];
					tk2.qtc.pg=c[1];
					tk2.qtc.pb=c[2];
				}
				U=true;
			}
			break;
		case 20:
			if(tk.ft==FT_lr_n||tk.ft==FT_lr_c) {
				var c=colorstr2int(menu.lr.ncolor.style.backgroundColor);
				tk.qtc.nr=c[0];
				tk.qtc.ng=c[1];
				tk.qtc.nb=c[2];
				tkreg.qtc.nr=c[0];
				tkreg.qtc.ng=c[1];
				tkreg.qtc.nb=c[2];
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.nr=c[0];
					tk2.qtc.ng=c[1];
					tk2.qtc.nb=c[2];
				}
				U=true;
			}
			break;
		case 21:
			if(tk.qtc.pcolorscore!=undefined) {
				tk.qtc.pcolorscore=parseFloat(menu.lr.pcscore.value);
				tkreg.qtc.pcolorscore=tk.qtc.pcolorscore;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.pcolorscore=tk.qtc.pcolorscore;
				}
				U=true;
			}
			break;
		case 22:
			if(tk.qtc.ncolorscore!=undefined) {
				tk.qtc.ncolorscore=parseFloat(menu.lr.ncscore.value);
				tkreg.qtc.ncolorscore=tk.qtc.ncolorscore;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.ncolorscore=tk.qtc.ncolorscore;
				}
				U=true;
			}
			break;
		case 23:
			if(tk.qtc.pfilterscore!=undefined) {
				tk.qtc.pfilterscore=parseFloat(menu.lr.pfscore.value);
				tkreg.qtc.pfilterscore=tk.qtc.pfilterscore;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.pfilterscore=tk.qtc.pfilterscore;
				}
				A=true;
				U=H=M=false;
				A_tklst.push(tk);
			}
			break;
		case 24:
			if(tk.qtc.nfilterscore!=undefined) {
				tk.qtc.nfilterscore=parseFloat(menu.lr.nfscore.value);
				tkreg.qtc.nfilterscore=tk.qtc.nfilterscore;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.nfilterscore=tk.qtc.nfilterscore;
				}
				A=true;
				U=H=M=false;
				A_tklst.push(tk);
			}
			break;
		case 25:
			var check=menu.c45.combine.checked;
			menu.c45.combine_chg.div.style.display='none';
			if(tk.ft==FT_cm_c && tk.cm.combine!=check) {
				tk.cm.combine=check;
				tkreg.cm.combine=check;
				if(tk.cm.combine && tk.cm.set.chg_f && tk.cm.set.chg_r) {
					menu.c45.combine_chg.div.style.display='block';
					menu.c45.combine_chg.checkbox.checked=tk.cm.combine_chg;
				}
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.cm.combine=check;
				}
				U=true;
				H=true;
			}
			break;
		case 26:
			var check=menu.c45.scale.checked;
			if(tk.ft==FT_cm_c && tk.cm.scale!=check) {
				tk.cm.scale=check;
				tkreg.cm.scale=check;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.cm.scale=check;
				}
				U=true;
			}
			break;
		case 27:
			if(tk.ft==FT_cm_c) {
				var c=gflag.menu.cmtk_colorcell;
				var cc=c.style.backgroundColor;
				if(c.bg) {
					tk.cm.bg[c.which]=cc;
					tkreg.cm.bg[c.which]=cc;
				} else {
					tk.cm.color[c.which]=cc;
					tkreg.cm.color[c.which]=cc;
				}
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					if(c.bg) {
						tk2.cm.bg[c.which]=cc;
					} else {
						tk2.cm.color[c.which]=cc;
					}
				}
				U=true;
			}
			break;
		case 28:
			if(useScore) {
				var scale=tk.scorescalelst[tk.showscoreidx];
				scale.type=scale_fix;
				scale.min=gflag.menu.hammock_focus.min;
				scale.max=gflag.menu.hammock_focus.max;
				var s2=tk.scorescalelst[tk.showscoreidx];
				s2.type=scale_fix;
				s2.min=scale.min;
				s2.max=scale.max;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					s2=tk2.scorescalelst[tk.showscoreidx];
					s2.type=scale_fix;
					s2.min=gflag.menu.hammock_focus.min;
					s2.max=gflag.menu.hammock_focus.max;
				}
				U=true;
				if(tk.group!=undefined) {
					groupScaleChange[tk.group]={scale:scale_fix, min:scale.min, max:scale.max};
				}
			} else if(isNumerical(tk)) {
				// "Apply to all" spilling over
				tk.qtc.thtype=scale_fix;
				tk.qtc.thmin=gflag.menu.hammock_focus.min;
				tk.qtc.thmax=gflag.menu.hammock_focus.max;
				tkreg.qtc.thtype=scale_fix;
				tkreg.qtc.thmin=tk.qtc.thmin;
				tkreg.qtc.thmax=tk.qtc.thmax;
				qtc_thresholdcolorcell(tk.qtc);
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.thtype=scale_fix;
					tk2.qtc.thmin=tk.qtc.thmin;
					tk2.qtc.thmax=tk.qtc.thmax;
				}
				U=true;
				if(tk.group!=undefined) {
					groupScaleChange[tk.group]={scale:scale_fix, min:tk.qtc.thmin, max:tk.qtc.thmax};
				}
			}
			break;
		case 29:
			// must be calling with auto scale
			if(useScore) {
				tk.scorescalelst[tk.showscoreidx].type=scale_auto;
				tkreg.scorescalelst[tk.showscoreidx].type=scale_auto;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.scorescalelst[tk.showscoreidx].type=scale_auto;
				}
				U=true;
				M=true;
				if(tk.group!=undefined) {
					groupScaleChange[tk.group]={scale:scale_auto};
				}
			} else if(isNumerical(tk)) {
				// "Apply to all" spilling over
				tk.qtc.thtype=scale_auto;
				tkreg.qtc.thtype=scale_auto;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.thtype=scale_auto;
				}
				U=true;
				if(tk.group!=undefined) {
					groupScaleChange[tk.group]={scale:scale_auto};
				}
			}
			break;
		case 30:
			if(tk.showscoreidx!=undefined) {
				tk.showscoreidx=gflag.menu.hammock_focus.scoreidx;
				tkreg.showscoreidx=tk.showscoreidx;
				if(tk.ft==FT_ld_c ||tk.ft==FT_ld_n) {
					bbj.stack_track(tk,0);
				}
				for(var a in bbj.splinters) {
					var b2=bbj.splinters[a];
					var tk2=b2.findTrack(tk.name);
					if(!tk2) continue;
					tk2.showscoreidx=tk.showscoreidx;
					if(tk.ft==FT_ld_c ||tk.ft==FT_ld_n) {
						b2.stack_track(tk2,0);
					}
				}
				U=true;
				M=true;
				if(tk.group!=undefined) {
					if(bbj.tkgroup[tk.group].scale==scale_auto) {
						// need updating group scale
						groupScaleChange[tk.group]={scale:scale_auto};
					}
				}
			}
			break;
		case 31:
			if(menu.c45.filter.checkbox.checked) {
				menu.c45.filter.div.style.display='block';
				var fv=parseInt(menu.c45.filter.input.value);
				if(isNaN(fv) || fv<=0) print2console('Filter read depth value must be positive integer',2);
				if(tk.ft==FT_cm_c) {
					tk.cm.filter=fv;
					tkreg.cm.filter=fv;
					for(var a in bbj.splinters) {
						var tk2=bbj.splinters[a].findTrack(tk.name);
						if(!tk2) continue;
						tk2.cm.filter=fv;
					}
					U=true;
				}
			} else {
				menu.c45.filter.div.style.display='none';
				if(tk.ft==FT_cm_c) {
					tk.cm.filter=0;
					tkreg.cm.filter=0;
					for(var a in bbj.splinters) {
						var tk2=bbj.splinters[a].findTrack(tk.name);
						if(!tk2) continue;
						tk2.cm.filter=0;
					}
					U=true;
				}
			}
			break;
		case 32:
			if(isNumerical(tk)) {
				// need to escape cmtk?
				tk.qtc.summeth=parseInt(menu.c59.select.options[menu.c59.select.selectedIndex].value);
				tkreg.qtc.summeth=tk.qtc.summeth;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.qtc.summeth=tk.qtc.summeth;
				}
				A=true;
				U=H=M=false;
				A_tklst.push(tk);
			}
			break;
		case 33:
			tk.qtc.bg=palette.output;
			if(!tkreg.qtc) tkreg.qtc={};
			tkreg.qtc.bg=tk.qtc.bg;
			for(var a in bbj.splinters) {
				var tk2=bbj.splinters[a].findTrack(tk.name);
				if(!tk2) continue;
				tk2.qtc.bg=tk.qtc.bg;
			}
			U=true;
			break;
		case 38:
			var usebg=menu.c44.checkbox.checked;
			tk.qtc.bg=usebg?menu.c44.color.style.backgroundColor:null;
			if(!tkreg.qtc) tkreg.qtc={};
			tkreg.qtc.bg=tk.qtc.bg;
			for(var a in bbj.splinters) {
				var tk2=bbj.splinters[a].findTrack(tk.name);
				if(!tk2) continue;
				tk2.qtc.bg=tk.qtc.bg;
			}
			U=true;
			break;
		case 34:
			if(tk.ft!=FT_cat_n && tk.ft!=FT_cat_c) continue;
			tk.cateInfo[gflag.menu.catetk.itemidx][1]=palette.output;
			for(var a in bbj.splinters) {
				var tk2=bbj.splinters[a].findTrack(tk.name);
				if(!tk2) continue;
				tk2.cateInfo[gflag.menu.catetk.itemidx][1]=palette.output;
			}
			U=true;
			break;
		case 35:
			// restoring cate color on available for native tracks
			if(tk.ft!=FT_cat_n) continue;
			var _o=bbj.genome.getTkregistryobj(tk.name,tk.ft);
			if(!_o) continue;
			cateInfo_copy(_o.cateInfo, tk.cateInfo);
			cateCfg_show(tk,false);
			for(var a in bbj.splinters) {
				var tk2=bbj.splinters[a].findTrack(tk.name);
				if(!tk2) continue;
				cateInfo_copy(_o.cateInfo, tk2.cateInfo);
			}
			U=true;
			break;
		case 37:
			if(tk.ft!=FT_bedgraph_n && tk.ft!=FT_bedgraph_c) continue;
			var usebg=menu.c29.checkbox.checked;
			tk.qtc.barplotbg=usebg?menu.c29.color.style.backgroundColor:null;
			tkreg.qtc.barplotbg=tk.qtc.barplotbg;
			for(var a in bbj.splinters) {
				var tk2=bbj.splinters[a].findTrack(tk.name);
				if(!tk2) continue;
				tk2.qtc.barplotbg=tk.qtc.barplotbg;
			}
			U=true;
			break;
		case 36:
			if(tk.ft!=FT_bedgraph_n && tk.ft!=FT_bedgraph_c) continue;
			tk.qtc.barplotbg=palette.output;
			tkreg.qtc.barplotbg=tk.qtc.barplotbg;
			for(var a in bbj.splinters) {
				var tk2=bbj.splinters[a].findTrack(tk.name);
				if(!tk2) continue;
				tk2.qtc.barplotbg=tk.qtc.barplotbg;
			}
			U=true;
			break;
		case 39:
			var check=menu.c45.combine_chg.checkbox.checked;
			if(tk.ft==FT_cm_c && tk.cm.set.chg_f && tk.cm.set.chg_r && tk.cm.combine_chg!=check) {
				tk.cm.combine_chg=check;
				tkreg.cm.combine_chg=check;
				for(var a in bbj.splinters) {
					var tk2=bbj.splinters[a].findTrack(tk.name);
					if(!tk2) continue;
					tk2.cm.combine_chg=check;
				}
				U=true;
				H=true;
			}
			break;
		case 40:
			if(tk.ft==FT_bigwighmtk_n||tk.ft==FT_bigwighmtk_c||tk.ft==FT_bedgraph_n||tk.ft==FT_bedgraph_c) {
				tk.qtc.curveonly= menu.c66.checkbox.checked;
				U=true;
			}
			break;
			// eee
		default: fatalError('bbj tk: unknown update context');
		}
		if(U) {
			bbj.updateTrack(tk,H);
		}
		if(M) {
			config_dispatcher(tk);
		}
	}
	for(var groupid=0; groupid<groupScaleChange.length; groupid++) {
		var x=groupScaleChange[groupid];
		if(!x) continue;
		var y=bbj.tkgroup[groupid];
		if(!y) {
			print2console('bbj.tkgroup['+groupid+'] missing',2);
			bbj.tkgroup[groupid]={scale:scale_auto,min:0,min_show:0,max:1,max_show:1};
			y=bbj.tkgroup[groupid];
		}
		if(x.scale!=undefined) {
			y.scale=x.scale;
		}
		if(y.scale==scale_auto) {
			bbj.tkgroup_setYscale(groupid);
		} else {
			if(x.min==undefined || x.max==undefined) fatalError('not getting min/max for fixed group y scale');
			y.min=y.min_show=x.min;
			y.max=y.max_show=x.max;
		}
		for(var i=0; i<bbj.tklst.length; i++) {
			var t=bbj.tklst[i];
			if(t.group==groupid) {
				bbj.drawTrack_browser(t);
			}
		}
	}
	if(takelog) {
		if(bbj.onupdatex) {
			bbj.onupdatex();
			menu_hide();
		}
	}
	if(A) {
		if(A_tklst.length==0) {
			print2console('A set to true A_tklst is empty',2);
		} else {
			bbj.ajax_addtracks(A_tklst);
		}
		return;
	}
	return;
case 15:
	var hvobj=apps.circlet.hash[gflag.menu.viewkey];
	switch(updatecontext) {
	case 19:
		hvobj.callingtk.pcolor=colorstr2int(menu.lr.pcolor.style.backgroundColor).join(',');
		break;
	case 20:
		hvobj.callingtk.ncolor=colorstr2int(menu.lr.ncolor.style.backgroundColor).join(',');
		break;
	case 21:
		hvobj.callingtk.pscore=parseFloat(menu.lr.pcscore.value);
		break;
	case 22:
		hvobj.callingtk.nscore=parseFloat(menu.lr.ncscore.value);
		break;
	default: fatalError('circlet callingtk: unknown update context');
	}
	hengeview_draw(gflag.menu.viewkey);
	return;
case 19:
	// track idx identified in gflag.menu.wreathIdx
	var tk=apps.circlet.hash[gflag.menu.viewkey].wreath[gflag.menu.wreathIdx];
	switch(updatecontext) {
	case 1:
		var c=colorstr2int(menu.c50.color1.style.backgroundColor);
		tk.qtc.pr=c[0];
		tk.qtc.pg=c[1];
		tk.qtc.pb=c[2];
		break;
	case 2:
		var c=colorstr2int(menu.c50.color2.style.backgroundColor);
		tk.qtc.nr=c[0];
		tk.qtc.ng=c[1];
		tk.qtc.nb=c[2];
		break;
	case 3:
		tk.qtc.pth=menu.c50.color1_1.style.backgroundColor;
		break;
	case 4:
		tk.qtc.nth=menu.c50.color2_1.style.backgroundColor;
		break;
	case 34:
		hvobj.cateInfo[gflag.menu.catetk.itemidx][1]=palette.output;
		break;
	default:fatalError('wreath tk: unknown update context');
	}
	hengeview_draw(gflag.menu.viewkey);
	return;
case 20:
	var tk=bbj.genome.bev.tklst[gflag.menu.bevtkidx];
	switch(updatecontext) {
	case 1:
		var c=colorstr2int(menu.c50.color1.style.backgroundColor);
		tk.qtc.pr=c[0];
		tk.qtc.pg=c[1];
		tk.qtc.pb=c[2];
		break;
	case 2:
		var c=colorstr2int(menu.c50.color2.style.backgroundColor);
		tk.qtc.nr=c[0];
		tk.qtc.ng=c[1];
		tk.qtc.nb=c[2];
		break;
	case 3:
		tk.qtc.pth=menu.c50.color1_1.style.backgroundColor;
		break;
	case 4:
		tk.qtc.nth=menu.c50.color2_1.style.backgroundColor;
		break;
	case 5:
		var v=parseInt(menu.c51.select.options[menu.c51.select.selectedIndex].value);
		tk.qtc.thtype=v;
		if(v==scale_percentile) {
			tk.qtc.thpercentile=parseInt(menu.c51.percentile.says.innerHTML);
		}
		qtc_thresholdcolorcell(tk.qtc);
		break;
	case 6:
		tk.qtc.thtype=scale_fix;
		tk.qtc.thmin=parseFloat(menu.c51.fix.min.value);
		tk.qtc.thmax=parseFloat(menu.c51.fix.max.value);
		qtc_thresholdcolorcell(tk.qtc);
		break;
	case 32:
		tk.qtc.summeth=parseInt(menu.c59.select.options[menu.c59.select.selectedIndex].value);
		bbj.bev_ajax([tk]);
		return;
	case 34:
		tk.cateInfo[gflag.menu.catetk.itemidx][1]=palette.output;
		break;
	default: fatalError('bev tk: unknown update context');
	}
	bbj.genome.bev_draw_track(tk);
	return;
default:
	fatalError('unknown menu context');
}
}

Browser.prototype.updateTrack=function(tk,changeheight)
{
// by updating various controls, color, scale, height.. no svg
var bbj=this;
if(this.splinterTag) {
	bbj=this.trunk;
	var t=bbj.findTrack(tk.name);
	if(!t) {
		print2console(tk.name+' is missing from trunk',2);
		return;
	}
	tk=t;
}
if(tk.cotton && tk.ft!=FT_weaver_c) {
	// a cotton track
	if(!bbj.weaver.iscotton) {
		/* calling from target bbj but must use cottonbbj to draw cottontk
		since need to observe cotton.weaver.insert
		*/
		bbj=bbj.weaver.q[tk.cotton];
	}
}
bbj.stack_track(tk,0);
bbj.drawTrack_browser(tk);
if(changeheight) {
	bbj.drawMcm_onetrack(tk);
	bbj.trackHeightChanged();
	// must adjust for splinters
	for(var tag in bbj.splinters) {
		bbj.splinters[tag].trackHeightChanged();
	}
	if(indicator3.style.display=='block') {
		/* adjust indicator3
		in case of right clicking on splinter, must use splinter bbj which is registered in gflag.menu.bbj
		*/
		var b2=menu.style.display=='block'?gflag.menu.bbj:bbj;
		if(menu.c53.checkbox.checked) {
			indicator3cover(b2);
		} else {
			b2.highlighttrack(gflag.menu.tklst);
		}
	}
}
}






/*** __cloak__ ***/
function invisible_shield(dom)
{
var pos=absolutePosition(dom);
if(pos[0]+pos[1]<0) return;
// means div2 is visible
invisibleBlanket.style.display='block';
invisibleBlanket.style.left=pos[0];
invisibleBlanket.style.top=pos[1];
invisibleBlanket.style.width=dom.clientWidth;
invisibleBlanket.style.height=dom.clientHeight;
}
function cloakPage()
{
// cast shadow over entire page
pagecloak.style.display = 'block';
pagecloak.style.height = Math.max(window.innerHeight,document.body.offsetHeight);
pagecloak.style.width = Math.max(window.innerWidth,document.body.offsetWidth);
}

Browser.prototype.cloak=function()
{
if(!this.main) return;
loading_cloak(this.main);
}

Browser.prototype.shieldOn=function()
{
if(!this.main || !this.shield) return;
var d=this.main;
var s=this.shield;
s.style.display='block';
s.style.width=d.offsetWidth;
s.style.height=d.offsetHeight;
}

Browser.prototype.shieldOff=function()
{
if(!this.shield) return;
this.shield.style.display='none';
}

Browser.prototype.unveil=function() { loading_done(); }

function loading_cloak(dom)
{
// images/loading.gif size: 128x128
var pos=absolutePosition(dom);
waitcloak.style.display='block';
waitcloak.style.left=pos[0];
waitcloak.style.top=pos[1];
var w=dom.clientWidth;
var h=dom.clientHeight;
waitcloak.style.width=w;
waitcloak.style.height=h;
// roller
waitcloak.firstChild.style.marginTop = h>128 ? (h-128)/2 : 0;
waitcloak.firstChild.style.marginLeft = w>128 ? (w-128)/2 : 0;
}
function loading_done() { waitcloak.style.display='none'; }

/*** __cloak__ ends ***/






/*** __ajax__ ***/



Browser.prototype.ajaxSaveUrlpiece=function(callback)
{
var url=this.cached_url;
if(this.urloffset >= url.length) {
	// entire URL has been saved, run it with callback
	this.ajax('reviveURL=on&dbName='+this.genome.name, callback);
	return;
}
var req=new XMLHttpRequest();
var bbj=this;
req.onreadystatechange= function() { 
	if(req.readyState==4 && req.status==200) {
		var t=req.responseText;
		try {eval('('+t+')');}
		catch(err) {
			gflag.badjson.push(t);
			fatalError('wrong JSON during caching URL');
		}
		bbj.urloffset += urllenlimit;
		bbj.ajaxSaveUrlpiece(callback);
	}
};
req.open("POST", gflag.cors_host+"/cgi-bin/subtleKnife?NODECODE=on&offset="+this.urloffset+"&saveURLpiece="+escape(url.substr(this.urloffset, urllenlimit))+"&session="+this.sessionId+"&dbName="+this.genome.name, true);
req.send();
}

Browser.prototype.ajax=function(queryUrl, callback)
{
/* in case of too long url, need to send it in small pieces one at a time
to get rid of "Request Entity Too Large" error on server

in case of saving status, don't run ajaxSaveUrlpiece(), 
as the already-escaped url will be escaped again,
and there's no good way to unescape on server-side

won't process abort directive from returned json packet

tell from the head of queryUrl if it is saving status
*/
if(queryUrl.length > urllenlimit) {
	this.urloffset = 0;
	this.cached_url=queryUrl;
	this.ajaxSaveUrlpiece(callback);
	return;
}
var req = new XMLHttpRequest();

req.onreadystatechange= function() { 
	if(req.readyState==4 && req.status==200) {
		var t=req.responseText;
		try {
			var data = eval('('+t+')');
		} catch(err) {
			// unrecoverable??
			gflag.badjson.push(t);
			print2console('Json syntax error...',3);
			callback(null);
			return;
		}
		callback(data);
	}
};
req.open("GET", gflag.cors_host+'/cgi-bin/subtleKnife?'+escape(queryUrl)+'&session='+this.sessionId+'&statusId='+this.statusId+'&hmspan='+this.hmSpan+
	(this.ajax_phrase?this.ajax_phrase:''), true);
req.send();
}


function ajaxPost(data2post, callback)
{
var req= new XMLHttpRequest();
req.onreadystatechange= function() { 
	if(req.readyState==4 && req.status==200) {
		var t=req.responseText;
		if(t.substr(0,5)=='ERROR') {
			print2console('Failed to post data to server',3);
			callback(null);
		} else {
			callback(t);
		}
	}
};
req.open('POST', gflag.cors_host+'/cgi-bin/postdeposit', true);
req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
req.send(data2post);
}

Browser.prototype.ajaxText=function(url, callback)
{
// don't use with long url
var req= new XMLHttpRequest();
req.onreadystatechange= function() { 
	if(req.readyState==4 && req.status==200) {
		var t=req.responseText;
		if(t.substr(0,5)=='ERROR') {
			print2console(t.substr(6),3);
			callback(null);
		} else {
			callback(t);
		}
	}
};
req.open("GET", gflag.cors_host+'/cgi-bin/subtleKnife?'+escape(url),true);
req.send();
}


/*** __ajax__ ends ***/





/*** __base__ ***/

Browser.prototype.loadgenome_initbrowser=function(param)
{
/* to fill up a freshly-made browser scaffold with genome data
if the genome is missing, load it first
browser data content (tracks, mcm) can be customized by param
args:
- browserparam: arg of ajax_loadbbjdata()
- genomeparam: arg for initiating genome obj
the rest are ajax arg for loading genome
*/

if(param.dbname in genome) {
	this.genome=genome[param.dbname];
	this.runmode_set2default();
	this.migratedatafromgenome();
	this.init_bbj_param=param.browserparam;
	this.ajax_loadbbjdata(param.browserparam);
	return;
}

// genome is not there, load it first
this.init_bbj_param=param.browserparam;
var p=param.genomeparam;
this.init_genome_param=p;
this.onunknowngenome=param.onunknowngenome;
/*** load genome info ***/
var bbj=this;
this.ajax('loadgenome=on&dbName='+param.dbname+(param.serverload?'&serverload=on':''),function(data){bbj.loadgenome_gotdata(data);});
}

Browser.prototype.loadgenome_gotdata=function(data)
{
if(!data) {
	fatalError('Crashed when loading genome info!');
	return;
}
if(data.unknowngenomedb) {
	if(this.onunknowngenome) {
		this.onunknowngenome(data.unknowngenomedb);
	} else {
		alert('Unknown genome name: '+data.unknowngenomedb);
	}
	return;
}
var genomeobj=new Genome(this.init_genome_param);
genomeobj.jsonGenome(data);
genome[genomeobj.name]=genomeobj;
this.genome=genomeobj;
if(apps.session) {
	this.show_sessionid();
}
this.runmode_set2default();
this.migratedatafromgenome();
if(data.trashDir) {
	gflag.trashDir=data.trashDir;
}
this.__jsonPageinit(data);
print2console(this.genome.name+' genome loaded',1);
this.ajax_loadbbjdata(this.init_bbj_param);
}

Browser.prototype.ajax_loadbbjdata=function(param)
{
/*** load all types of data ***
fill data for a browser, do some proper setup
genome object must already been built
handles multiple triggers in iterative manner
TODO .genome.defaultStuff.initmatplot should be handled somewhere else
*/
if(!param) {
	// escape iteration
	this.shieldOff();
	loading_done();
	if(this.onloadend_once) {
		this.onloadend_once(this);
		delete this.onloadend_once;
	}
	return;
}
if(param.session) {
	var oldsession=param.session;
	delete this.init_bbj_param;
	var bbj=this;
	this.validatesession(oldsession,param.statusId,function(data){bbj.initbrowser_session(data);});
	return;
}
if(param.defaultcontent) {
	delete param.defaultcontent;
	this.adddecorparam(this.genome.defaultStuff.decor);

	if(!param.coord_rawstring) {
		param.coord_rawstring=this.genome.defaultStuff.coord;
	}
	/*
	// no matplot, auto height adjustment about numerical tracks
	// only adjust height of bedgraph and bigwig, not cat
	var _lst=[];
	for(var i=0; i<bbj.tklst.length; i++) {
		var t=bbj.tklst[i];
		if(t.ft==FT_bigwighmtk_n||t.ft==FT_bedgraph_n) {
			_lst.push(t);
		}
	}
	var h2=parseInt((document.body.clientHeight-400)/_lst.length);
	if(h2<bbj.minTkheight) h2=bbj.minTkheight;
	else if(h2>max_initial_qtkheight) h2=max_initial_qtkheight;
	for(i=0; i<_lst.length; i++) _lst[i].qtc.height=h2;
	*/
}
if(param.mcm_termlst) {
	if(this.weaver && this.weaver.iscotton) {
		// don't do it
	} else if(this.mcm) {
		var lst=[];
		for(var i=0; i<param.mcm_termlst.length; i++) {
			var m1=param.mcm_termlst[i];
			var isnew=true;
			for(var j=0; j<this.mcm.lst.length; j++) {
				var m2=this.mcm.lst[j];
				if(m2[1]==m1[1] && m2[0]==m1[0]) {
					isnew=false;
					break;
				}
			}
			if(isnew) {
				lst.push(m1);
			}
		}
		if(lst.length>0) {
			this.mcm.lst=this.mcm.lst.concat(lst);
		}
	}
	delete param.mcm_termlst;
}
/* dsp
only alter dsp when geneset is given, or .regionLst is empty!
even if coord params are not given, dsp will also be set to default, good idea
*/
if(param.gsvparam) {
	var p=param.gsvparam;
	if(p.viewrange) {
		this.run_gsv(p.list,p.viewrange);
	} else {
		this.run_gsv(p.list);
	}
	delete param.gsvparam;
	return;
}
if(param.geneset_rawstring) {
	var s = param.geneset_rawstring;
	if(!apps.gsm || !this.genome.geneset) {
		print2console('cannot process geneset: gene set function not available!',2);
		delete param.geneset_rawstring;
		return;
	}
	apps.gsm.bbj=this;
	this.genome.geneset.textarea_submitnew.value=s.replace(/,/g,'\n');
	gflag.gs_load2gsv=true;
	addnewgeneset_pushbutt();
	// try add this gene set
	delete param.geneset_rawstring;
	return;
} else if(param.coord_rawstring || param.juxtapose_rawstring || this.regionLst.length==0) {
	if(this.genome.iscustom) {
		/* custom genome, avoid ajax
		decide dsp by js, duplicate task of cgi
		*/
		var data={}; // returned json obj
		// border
		var slst=this.genome.scaffold.current;
		data.border=[slst[0],0,slst[slst.length-1],this.genome.scaffold.len[slst[slst.length-1]]];
		// regions
		data.regionLst=[];
		var c=this.defaultposition();
		var startchr=c[0], stopchr=c[2], startcoord=c[1], stopcoord=c[3];
		if(param.coord_rawstring) {
			var c=this.parseCoord_wildgoose(param.coord_rawstring,true);
			if(c.length==3) {
				startchr=stopchr=c[0];
				startcoord=c[1];
				stopcoord=c[2];
			} else if(c.length==4) {
				startchr=c[0];
				startcoord=c[1];
				stopchr=c[2];
				stopcoord=c[3];
			}
			delete param.coord_rawstring;
		}
		var totallen=0;
		var inuse=false;
		for(var i=0; i<slst.length; i++) {
			var a=0,
				b=this.genome.scaffold.len[startchr];
			if(slst[i]==startchr) {
				a=startcoord;
				inuse=true;
			}
			if(slst[i]==stopchr) {
				b=stopcoord;
				inuse=true;
			}
			if(inuse) {
				data.regionLst.push([slst[i],0,this.genome.scaffold.len[slst[i]],a,b,this.hmSpan*3,'']);
				totallen+=b-a;
			}
			if(slst[i]==stopchr) break;
			inuse=false;
		}
		// find view start!
		var j=0;
		for(var i=0; i<data.regionLst.length; i++) {
			var a=data.regionLst[i][3],
				b=data.regionLst[i][4];
			if(j<totallen/3 && j+b-a>totallen/3) {
				data.viewStart=[i,a+totallen/3-j];
				break;
			}
			j+=b-a;
		}
		data.tkdatalst=[];
		this.ajaxX_cb(data);
		return;
	}
	// given coord, or juxtaposition
	var c=this.defaultposition();
	var startchr=c[0], stopchr=c[2], startcoord=c[1], stopcoord=c[3];
	if(param.coord_rawstring) {
		var c=this.parseCoord_wildgoose(param.coord_rawstring,true);
		if(c.length==3) {
			startchr=stopchr=c[0];
			startcoord=c[1];
			stopcoord=c[2];
		} else if(c.length==4) {
			startchr=c[0];
			startcoord=c[1];
			stopchr=c[2];
			stopcoord=c[3];
		}
		delete param.coord_rawstring;
	}
	var paramstring='changeGF=on&dbName='+this.genome.name+'&startChr='+startchr+'&startCoord='+startcoord+'&stopChr='+stopchr+'&stopCoord='+stopcoord;
	if(param.juxtapose_rawstring) {
		var bbf = param.juxtapose_rawstring;
		if(param.juxtaposecustom) {
			// custom bed
			this.juxtaposition.type = RM_jux_c;
			this.juxtaposition.note = "custom bed track";
			this.juxtaposition.what = bbf;
			paramstring += '&runmode='+RM_jux_c+'&juxtaposeTk='+bbf;
			print2console('Running juxtaposition...',0);
			delete param.juxtaposecustom;
		} else {
			var tk=this.genome.decorInfo[bbf];
			if(tk) {
				// native
				this.juxtaposition.type = RM_jux_n;
				this.juxtaposition.note = tk.label;
				this.juxtaposition.what = bbf;
				paramstring += '&runmode='+RM_jux_n+'&juxtaposeTk='+bbf;
				print2console('Running juxtaposition...',0);
			} else {
				print2console('Not running juxtapose: unknown native bed/annotation track name', 2);
				paramstring += '&runmode='+this.genome.defaultStuff.runmode;
			}
		}
		delete param.juxtapose_rawstring;
	} else {
		paramstring+='&runmode='+this.genome.defaultStuff.runmode;
	}
	print2console('Setting view range...',0);
	this.ajaxX(paramstring,true);
	return;
}
/* tracks
*/
if(param.mustaddcusttk) {
	// in effect for loading tracks
	this.mustaddcusttk=true;
	delete param.mustaddcusttk;
}
if(param.datahub_json) {
	// json file
	this.loadhub_urljson(param.datahub_json);
	delete param.datahub_json;
	return;
}
if(param.datahub_ucsc) {
	this.loaddatahub_ucsc(param.datahub_ucsc);
	delete param.datahub_ucsc;
	return;
}
if(param.publichubloadlst) {
	if(this.genome.publichub.lst.length==0) {
		print2console('No public hub available for this genome!',2);
		delete param.publichubloadlst;
	} else {
		if(param.publichubloadlst.length==0) {
			delete param.publichubloadlst;
		} else {
			// load first hub in queue
			this.publichub_load(param.publichubloadlst.splice(0,1));
			return;
		}
	}
}
if(param.hubjsoncontent) {
	var j=param.hubjsoncontent;
	delete param.hubjsoncontent;
	this.loaddatahub_json(j);
	return;
}
if(param.forceshowallhubtk) {
	delete param.forceshowallhubtk;
}
if(param.native_track) {
	/* native tracks with name-only, no ft, from urlparam
	valid items that are not displayed yet will be added to param.tklst
	*/
	// guard against repetitive ones
	var n2t={};
	for(var i=0; i<param.native_track.length; i++) {
		var t=param.native_track[i];
		n2t[t.name]=t;
	}
	var _lst=[];
	for(var name in n2t) {
		if(this.findTrack(name)) continue;
		var t2=this.genome.parse_native_track(n2t[name]);
		if(t2) {
			_lst.push(t);
		} else {
			print2console('Error parsing native track '+name,2);
		}
	}
	if(_lst.length>0) {
		if(!param.tklst) param.tklst=[];
		param.tklst=param.tklst.concat(_lst);
	}
	delete param.native_track;
}

if(param.weaver_raw) {
	// only from urlparam
	if(!param.tklst) param.tklst=[];
	for(var i=0; i<param.weaver_raw.length; i++) {
		var c=param.weaver_raw[i];
		if(c.query in gflag.tol_hash) {
			param.tklst.push({
				ft:FT_weaver_c,
				url:c.url,
				mode:M_full,
				cotton:c.query,
				weaver:{mode:W_fine},
				qtc:{stackheight:weavertkstackheight,bedcolor:weavertkcolor_query},
				label:c.query+' to '+this.genome.name});
		} else {
			// do not support custom genome
			print2console('Unrecognized genome name for linking: '+c.query,2);
			print2console('If this is a custom-built genome, use datahub to submit this track and include "newgenome" attribute',0);
		}
	}
	delete param.weaver_raw;
}

if(param.matplot) {
	// before getting data track, make display obj for matplot
	for(var i=0; i<param.matplot.length; i++) {
		var t= param.matplot[i];
		this.genome.registerCustomtrack(t);
		this.tklst.push(this.makeTrackDisplayobj(t.name,FT_matplot));
	}
	delete param.matplot;
}
if(param.tklst) {
	/********** the only place to call ajax_addtracks
	only singular tracks, not compound ones (cmtk)
	- native or custom
	- duplication allowed
	- must all have ft
	- must all be data track, not composite
	*/
	// remove redundancy
	var urlhash={}; // cust
	var namehash={}; // native
	for(var i=0; i<param.tklst.length; i++) {
		var t=param.tklst[i];
		if(t.ft==FT_weaver_c) {
			/*********** the only place to add weavertk
			the part of creating cottonbbj cannot be moved to ajax_addtracks
			since it involves loading query genome and relies on ajax_loadbbjdata
			*/
			if(!t.cotton) fatalError('pending weavertk has no cotton');
			if(!this.weaver) {
				this.weaver={insert:[],q:{},mode:W_rough};
				this.weavertoggle(this.hmSpan*(this.entire.atbplevel?1:this.entire.summarySize));
			}
			this.mcm_mayaddgenome();
			if(!t.weaver) {
				t.weaver={};
			}
			t.weaver.mode=this.weaver.mode;
			gflag.dspstat_showgenomename=true;
			if(!(t.cotton in this.weaver.q)) {
				// load cottonbbj
				var bbj=new Browser();
				this.weaver.q[t.cotton]=bbj;
				bbj.weaver={insert:[],iscotton:true,target:this};
				bbj.browser_makeDoms({
					mainstyle:'display:none;',
					facet:true,
				});

				// dummy
				if(bb) cc=bbj;
				else bb=bbj;

				var b2=this;
				bbj.onloadend_once=function(){
					bbj.hmSpan=b2.hmSpan;
					bbj.entire=b2.entire;
					bbj.leftColumnWidth=b2.leftColumnWidth;
					bbj.move=b2.move;
					bbj.hmdiv=b2.hmdiv;
					bbj.hmheaderdiv=b2.hmheaderdiv;
					bbj.decordiv=b2.decordiv;
					bbj.decorheaderdiv=b2.decorheaderdiv;
					if(b2.mcm) {
						bbj.mcm=b2.mcm;
					}
					b2.ajax_loadbbjdata(b2.init_bbj_param);
				};

				if(!(t.cotton in gflag.tol_hash)) {
					if(t.newgenome) {
						// create custom genome
						if(!t.newgenome.scaffoldlength) fatalError('.newgenome.scaffoldlength missing');
						if(!t.newgenome.defaultposition) fatalError('.newgenome.defaultposition missing');
						var scf1=[['ROOT','chromosome',0]];
						var scf2=[];
						for(var n in t.newgenome.scaffoldlength) {
							scf2.push(n);
							scf1.push(['chromosome',n,t.newgenome.scaffoldlength[n]]);
						}
						var g=new Genome({custom_track:true});
						g.jsonGenome({
							dbname:t.cotton,
							scaffoldInfo:scf1,
							defaultScaffold:scf2.join(','),
							defaultPosition:t.newgenome.defaultposition,
						});
						if(t.newgenome.sequencefile) {
							g.scaffold.fileurl=t.newgenome.sequencefile;
						}
						g.defaultStuff.runmode=RM_genome;
						g.hmtk={};
						g.decorInfo={};
						g.iscustom=true;
						genome[t.cotton]=g;
					} else {
						print2console('Unknow genome name: '+t.cotton,2);
						print2console('If this is a custom-built genome, use datahub to submit this track and include "newgenome" attribute',0);
					}
				}

				bbj.loadgenome_initbrowser({
					dbname:t.cotton,
					browserparam:null,
					genomeparam:{custom_track:true},
				});
				return;
			}
		}
		if(isCustom(t.ft)) {
			if(!t.url) {
				print2console('URL-less custom track: ('+t.name+', '+t.label+')',2);
				continue;
			}
			if(!this.mustaddcusttk) {
				if(this.genome.tkurlInUse(t.url)) {
					// XXXb
					var f=false;
					for(var j=0; j<this.tklst.length; j++) {
						if(this.tklst[j].url==t.url) {
							f=true;
							break;
						}
					}
					if(f) {
						continue;
					}
				}
			}
			// must check tk on display
			var skip=false;
			for(var j=0; j<this.tklst.length; j++) {
				if(t.url==this.tklst[j].url) {
					skip=true;
					break;
				}
			}
			if(skip) {
				continue;
			}
			if(t.name) {
				/* name already provided, should be from golden 
				patch here
				if registry obj already exist for this track
				need to update qtc
				since new track height could have been updated by other spins
				*/
				var _o=this.genome.hmtk[t.name];
				if(_o) {
					if(t.qtc && t.qtc.height) {
						if(!_o.qtc) {
							_o.qtc={};
						}
						_o.qtc.height=t.qtc.height;
					}
				}
			} else {
				t.name=this.genome.newcustomtrackname();
			}
			urlhash[t.url]=t;
		} else {
			if(this.findTrack(t.name)) continue;
			namehash[t.name]=t;
		}
	}
	delete param.tklst;
	var lst=[];
	for(var u in urlhash) {
		var o=urlhash[u];
		this.genome.pending_custtkhash[o.name]=o;
		lst.push(o);
	}
	for(var n in namehash) {
		lst.push(namehash[n]);
	}
	if(lst.length>0) {
		print2console('Loading <strong>'+lst.length+'</strong> tracks...',0);
		this.ajax_addtracks(lst);
		return;
	}
}
if(param.cmtk) {
	var namelst=[];
	for(var i=0; i<param.cmtk.length; i++) {
		var t= param.cmtk[i];
		this.genome.registerCustomtrack(t);
		var t2=this.makeTrackDisplayobj(t.name,FT_cm_c);
		this.tklst.push(t2);
		namelst.push(t.name);
		if(t2.cotton) {
			if(this.weaver && this.weaver.iscotton) {
				this.weaver.target.tklst.push(t2);
			}
		}
	}
	this.trackdom2holder();
	this.aftertkaddremove(namelst);
	delete param.cmtk;
}
if(param.show_linkagemap) {
	if(!this.genome.linkagegroup) {
		print2console('No linkage group data for this genome',2);
	} else {
		menu_shutup();
		menu.relocate.style.display=
		menu.relocate.div1.style.display='block';
		menu.relocate.div2.style.display='none';
		gflag.browser=this;
		gflag.menu.bbj=this;
		var div= param.show_linkagemap_div;
		var pos=absolutePosition(div);
		toggle25();
		menu.style.display='block';
		menu.style.left=pos[0];
		menu.style.top=pos[1];
	}
	delete param.show_linkagemap;
	delete param.show_linkagemap_div;
}

if(param.newbrowserlst) {
	for(var i=0; i<param.newbrowserlst.length; i++) {
		add_new_browser(param.newbrowserlst[i]);
	}
	delete param.newbrowserlst;
}
if(param.coord_notes) {
	if(!this.notes) {this.notes=[];}
	this.notes=this.notes.concat(param.coord_notes);
	delete param.coord_notes;
}
if(param.geneset_ripe) {
	if(this.genome.geneset) {
		this.genome.geneset.__pendinggs=this.genome.geneset.__pendinggs.concat(param.geneset_ripe);
		this.genome.addgeneset_recursive();
	}
	delete param.geneset_ripe;
}
if(param.askabouttrack) {
	delete param.askabouttrack;
	cloakPage();
	gflag.browser=this;
	var d=dom_create('div',document.body,'position:absolute;z-index:100;');
	gflag.askabouttrack=d;
	dom_create('div',d,'color:white;font-size:150%;padding-bottom:20px;text-align:center;').innerHTML=
		'The "'+this.genome.name+'" genome has been loaded.<br><br>'+
		'Would you like to go to ...';
	dom_create('div',d,'display:inline-block;margin-right:20px;',{c:'whitebar',
		t:'<span style="font-size:140%">C</span>USTOM tracks',
		clc:toggle7_2});
	if(this.genome.publichub.lst.length>0) {
		dom_create('div',d,'display:inline-block;margin-right:20px;',{c:'whitebar',t:'<span style="font-size:140%">P</span>UBLIC hubs <span style="font-size:80%">('+this.genome.publichub.lst.length+' available)</span>',clc:toggle8_2});
	}
	dom_create('div',d,'display:inline-block;',{c:'whitebar',t:'<span style="font-size:140%">G</span>ENOME browser &#187;',clc:toggle9});
	panelFadein(d,window.innerWidth/2-270,window.innerHeight/2-100);
}


this.initiateMdcOnshowCanvas();
this.prepareMcm();


if(param.track_order) {
	// adjust order
	if(param.track_order.length>0) {
		var newlst=[], used={};
		for(var i=0; i<param.track_order.length; i++) {
			var o=param.track_order[i];
			var t=this.findTrack(o.name,
				(this.weaver && this.weaver.iscotton)?this.genome.name:null);
			if(!t) {
				print2console(this.genome.name+'Missing track for reordering: '+o.name,2);
			} else {
				t.where=o.where;
				newlst.push(t);
				used[t.name]=1;
			}
		}
		for(i=0; i<this.tklst.length; i++) {
			var t=this.tklst[i];
			if(!(t.name in used)) {
				newlst.push(t);
			}
		}
		this.tklst=newlst;
		this.trackdom2holder();
	}
	delete param.track_order;
}


if(param.splinters) {
	/* birth place of splinters??
	this must be the last command to be processed, because it requires the trunk components to be made
	splinters is to be added in serial manner
	each time trunk will be shrinked, very inefficient
	*/
	var lst=[];
	for(var i=0; i<param.splinters.length; i++) {
		var str=param.splinters[i];
		if(str=='nocoord_fromapp') {
			lst.push({});
		} else {
			var c=this.genome.parseCoordinate(str,2);
			if(!c) {
				print2console('Invalid coordinate for adding secondary panel',2);
			} else {
				if(c[0]==c[2]) {
					lst.push({coord:c[0]+':'+c[1]+'-'+c[3]});
				}
			}
		}
	}
	delete param.splinters;
	if(lst.length>0) {
		this.splinter_pending=lst;
		// get new hmspan for everybody
		var newhm=0, shm=500;
		if(this.hmSpan>shm*(lst.length+1)) {
			newhm=this.hmSpan-shm*lst.length;
		} else {
			shm=400;
			if(this.hmSpan>shm*(lst.length+1)) {
				newhm=this.hmSpan-shm*lst.length;
			}
		}
		for(var i=0; i<lst.length; i++) {
			lst[i].width=shm;
		}
		if(newhm) {
			// will shrink trunk
			if(this.scalebar) {
				// move scale bar
				var s=this.scalebar;
				var newleft=newhm/2-25;
				s.slider.style.left = newleft;
				s.says.style.left = newleft - s.says.clientWidth - 3;
				s.arrow.style.left = newleft + 45;
				s.slider.width=50;
				scalebarbeam.style.left = newleft+this.leftColumnWidth;
				this.drawScalebarSlider();
			}
			// ajax
			this.sethmspan_refresh(newhm);
			return;
		}
	}
}
if(this.splinter_pending) {
	if(this.splinter_pending.length>0) {
		print2console('Adding a secondary panel...',0);
		var bbj=this;
		this.splinter_recursive(function(){bbj.ajax_loadbbjdata(bbj.init_bbj_param);});
		return;
	}
	delete this.splinter_pending;
}


this.render_browser(false);
this.generateTrackselectionLayout();

print2console('Stand by',1);
loading_done();

// a patch
var c=this.genome.custtk;
if(c) {
	var b=c.ui_hub.submit_butt;
	if(b.disabled) {
		b.disabled=false;
		flip_panel(c.buttdiv,c.ui_submit,false);
		apps.custtk.main.__hbutt2.style.display='none';
	}
}
this.shieldOff();
if(this.onloadend_once) {
	this.onloadend_once(this);
	delete this.onloadend_once;
}

if(this.weaver && this.weaver.iscotton) {
	// cottonbbj may have added tracks, have been squeezed into target, need to redo mcm
	var target=this.weaver.target;
	if(target.mcm) {
		if(!target.mcm.manuallysorted) {
			// sort against genome
			var mhi=target.mcm_mayaddgenome();
			if(mhi!=undefined) {
				target.mcm.sortidx=mhi;
				target.mcm_sort();
			}
		}
		target.prepareMcm();
		target.drawMcm();
	}
}

if(gflag.tol_hash) {
	var o=gflag.tol_hash[this.genome.name];
	if(o && o.snp) {
		this.genome.snptable=o.snp;
	}
}

delete this.init_bbj_param;
}



function trackParam(_tklst,nocotton)
{
/* nocotton: no cottontk
noweavertk: no FT_weaver_c, use when weaving is disabled at large view range
*/
var lst=[];
lst[FT_bedgraph_c]=[];
lst[FT_bedgraph_n]=[];
lst[FT_bigwighmtk_c]=[];
lst[FT_bigwighmtk_n]=[];
lst[FT_bam_n]=[];
lst[FT_bam_c]=[];
lst[FT_sam_n]=[];
lst[FT_sam_c]=[];
lst[FT_bed_n]=[];
lst[FT_bed_c]=[];
lst[FT_cat_c]=[];
lst[FT_cat_n]=[];
lst[FT_lr_n]=[];
lst[FT_lr_c]=[];
lst[FT_qdecor_n]=[];
lst[FT_weaver_c]=[];
lst[FT_ld_c]=[];
lst[FT_ld_n]=[];
lst[FT_anno_n]=[];
lst[FT_anno_c]=[];
lst[FT_catmat]=[];
lst[FT_qcats]=[];
for(var i=0; i<_tklst.length; i++) {
	var t=_tklst[i];
	if(nocotton && t.cotton && t.ft!=FT_weaver_c) {
		continue;
	}
	var name=t.name;
	var mode=t.mode;
	var url=t.url;
	var label=t.label;
	var summ=(!t.qtc || t.qtc.summeth==undefined)?summeth_mean:t.qtc.summeth;
	switch(t.ft) {
	case FT_bedgraph_c:
		lst[FT_bedgraph_c].push(name+','+label+','+url+','+mode+','+summ);
		break;
	case FT_bedgraph_n:
		lst[FT_bedgraph_n].push(name+','+url+','+mode+','+summ);
		break;
	case FT_bigwighmtk_c:
		lst[FT_bigwighmtk_c].push(name+','+label+','+url+','+mode+','+summ);
		break;
	case FT_bigwighmtk_n:
		lst[FT_bigwighmtk_n].push(name+','+url+','+mode+','+summ);
		break;
	case FT_cat_n:
		lst[FT_cat_n].push(name+','+url+','+mode);
		break;
	case FT_cat_c:
		lst[FT_cat_c].push(name+','+label+','+url+','+mode);
		break;
	case FT_bed_n:
		lst[FT_bed_n].push(name+','+url+','+mode);
		break;
	case FT_bed_c:
		lst[FT_bed_c].push(name+','+label+','+url+','+mode);
		break;
	case FT_bam_n:
		lst[FT_bam_n].push(name+','+url+','+mode);
		break;
	case FT_bam_c:
		lst[FT_bam_c].push(name+','+label+','+url+','+mode);
		break;
	case FT_lr_n:
		lst[FT_lr_n].push(name+','+url+','+mode+','+t.qtc.pfilterscore+','+t.qtc.nfilterscore);
		break;
	case FT_lr_c:
		lst[FT_lr_c].push(name+','+label+','+url+','+mode+','+t.qtc.pfilterscore+','+t.qtc.nfilterscore);
		break;
	case FT_ld_c:
		lst[FT_ld_c].push(name+','+label+','+url);
		break;
	case FT_ld_n:
		lst[FT_ld_n].push(name+','+url);
		break;
	case FT_matplot:
		break;
	case FT_cm_c:
		break;
	case FT_anno_n:
		lst[FT_anno_n].push(name+','+url+','+mode);
		break;
	case FT_anno_c:
		lst[FT_anno_c].push(name+','+label+','+url+','+mode);
		break;
	case FT_catmat:
		lst[FT_catmat].push(name+','+label+','+url+','+mode);
		break;
	case FT_qcats:
		lst[FT_qcats].push(name+','+label+','+url+','+mode);
		break;
	case FT_weaver_c:
		lst[FT_weaver_c].push(name+','+label+','+url+','+t.weaver.mode);
		break;
	default: fatalError('trackParam: unknown ft '+t.ft);
	}
}
return ''+
	(lst[FT_bedgraph_n].length>0 ? '&hmtk2='+lst[FT_bedgraph_n].join(',') : '')+
	(lst[FT_bedgraph_c].length>0 ? '&hmtk3='+lst[FT_bedgraph_c].join(",") : '')+
	(lst[FT_bigwighmtk_n].length>0 ? '&hmtk14='+lst[FT_bigwighmtk_n].join(',') : '')+
	(lst[FT_bigwighmtk_c].length>0 ? '&hmtk15='+lst[FT_bigwighmtk_c].join(',') : '')+
	(lst[FT_cat_n].length>0 ? '&hmtk12='+lst[FT_cat_n].join(',') : '')+
	(lst[FT_cat_c].length>0 ? '&hmtk13='+lst[FT_cat_c].join(",") : '')+
	(lst[FT_bed_n].length>0 ? '&decor0='+lst[FT_bed_n].join(',') : '') +
	(lst[FT_bed_c].length>0 ? '&decor1='+lst[FT_bed_c].join(',') : '') +
	(lst[FT_lr_n].length>0 ? '&decor9='+lst[FT_lr_n].join(',') : '') +
	(lst[FT_lr_c].length>0 ? '&decor10='+lst[FT_lr_c].join(',') : '') +
	(lst[FT_qdecor_n].length>0 ? '&decor8='+lst[FT_qdecor_n].join(',') : '') +
	(lst[FT_sam_n].length>0 ? '&decor4='+lst[FT_sam_n].join(',') : '') +
	(lst[FT_sam_c].length>0 ? '&decor5='+lst[FT_sam_c].join(',') : '')+
	(lst[FT_bam_n].length>0 ? '&decor17='+lst[FT_bam_n].join(',') : '') +
	(lst[FT_bam_c].length>0 ? '&decor18='+lst[FT_bam_c].join(',') : '')+
	(lst[FT_ld_c].length>0 ? '&track23='+lst[FT_ld_c].join(',') : '')+
	(lst[FT_ld_n].length>0 ? '&track26='+lst[FT_ld_n].join(',') : '')+
	(lst[FT_weaver_c].length>0 ? '&track21='+lst[FT_weaver_c].join(',') : '')+
	(lst[FT_anno_n].length>0 ? '&track24='+lst[FT_anno_n].join(',') : '') +
	(lst[FT_anno_c].length>0 ? '&track25='+lst[FT_anno_c].join(',') : '')+
	(lst[FT_catmat].length>0 ? '&track20='+lst[FT_catmat].join(',') : '')+
	(lst[FT_qcats].length>0 ? '&track27='+lst[FT_qcats].join(',') : '');
}


Browser.prototype.houseParam=function()
{
/* house keeping
*/
if(this.weaver) {
	return trackParam(this.tklst, this.weaver.iscotton?false:true)+
		'&dbName='+this.genome.name+
		this.genome.customgenomeparam();
}
return trackParam(this.tklst)+'&dbName='+this.genome.name+this.genome.customgenomeparam();
}
Browser.prototype.htestParams=function()
{
if(!this.htest.inuse) return '';
var lst = [];
for(var i=1; i<=this.htest.grpnum; i++) {
	lst.push("&htestgrp"+i+"="+this.htest["gtn"+i].join(","));
}
var v = getSelectValueById("htestc"); // correction
return "&htest=on&htestgrpnum="+this.htest.grpnum+lst.join("")+(v=="no" ? "" : "&htestc="+v);
}
Browser.prototype.corrParam=function()
{
/* if doing inter-track correlation, no need to interact with CGI,
and will return empty string
*/
if(!this.correlation.inuse) return "";
var tname = this.correlation.targetname;
var obj=this.findtkobj_display(tname);
switch(this.correlation.targetft) {
case FT_bed_n: // bigbed
	if(obj!=null && obj.mode==M_den)
		return "";
	return "&corrft=0&correlation="+tname;
case FT_bed_n: // bigbed (c)
	if(obj!=null && obj.mode==M_den)
		return "";
	return "&corrft=1&correlation="+obj.url;
case FT_bedgraph_c:
case FT_bedgraph_n:
case FT_bigwighmtk_c:
case FT_bigwighmtk_n:
	return "";
case FT_qdecor_n:
	// decor
	if(obj!=null)
		return "";
	return "&corrft=8&correlation="+tname;
default:
	fatalError("corrParam: unknown file type");
}
}

Browser.prototype.ajaxX=function(param,norendering)
{
/* special treatmet for following conditions
- jumping to a gene but got multiple hits
- gsv itemlist updating
- generate a splinter
*/
gflag.bbj_x_updating[this.horcrux]=1;
if(this.main) {
	// cottonbbj mainless
	this.shieldOn();
}
var bbj=this;
this.ajax(param+this.houseParam(),function(data){bbj.ajaxX_cb(data,norendering);});
}

Browser.prototype.ajaxX_cb=function(data,norendering)
{
delete gflag.bbj_x_updating[this.horcrux];
this.shieldOff();
if(!data) {
	print2console('Crashed upon ajaxX',3);
	return;
}
if(data.abort) {
	print2console(data.abort, 3);
} else {
	if(this.__pending_coord_hl) {
		this.highlight_regions[0]=this.__pending_coord_hl;
		delete this.__pending_coord_hl;
	}
	menu_hide();
	menu2.style.display='none';
	if(data.newscaffold) {
		this.ajax_scfdruntimesync();
	}
	this.jsonDsp(data);
	this.jsonTrackdata(data);
	this.move.direction=null;
	if(this.is_gsv() && data.ajaxXtrigger_gsvupdate) {
		/* gsv updating existing list
		always loses original dsp info
		returned regionLst always contains updated itemlist
		*/
		if(data.entirelst==undefined || data.entirelst.length==0) fatalError('gsv update: entirelst missing');
		this.genesetview.lst=data.entirelst;
		this.drawNavigator();
	}
	if(this.onupdatex) { this.onupdatex(this); }
	if(this.animate_zoom_stat==1) {
		/* browser shows the animated zoom effect
		now tk data is ready, quit, browser render will be done once animation is over
		*/
		this.animate_zoom_stat=0;
		return;
	}
	if(!norendering) {
		this.drawRuler_browser(false);
		this.drawTrack_browser_all();
		this.drawIdeogram_browser(false);
	}
}
this.ajax_loadbbjdata(this.init_bbj_param);
}


function genelist2selectiontable(genelst,table,callback)
{
stripChild(table,0);
var total=0;
for(var i=0; i<genelst.length; i++) {
	total+=genelst[i].lst.length;
}
var showlimit=30;
var showcount=Math.min(total,showlimit);
if(showcount<total) {
	var tr=table.insertRow(0);
	var td=tr.insertCell(0);
	td.colSpan=4;
	td.align='center';
	td.innerHTML='Showing first '+showlimit+' genes, '+(total-showcount)+' not shown';
}
// hardcoded genename, put xeno genes to bottom
var L1=[], L2=[];
for(var i=0; i<genelst.length; i++) {
	for(var j=0; j<genelst[i].lst.length; j++) {
		var g=genelst[i].lst[j];
		if(g.type && g.type.toLowerCase()=='xenorefgene') {
			L2.push(g);
		} else {
			L1.push(g);
		}
	}
}
genelst=L1.concat(L2);
// see if genes are in same chr, if so, use better graphic
var chr=genelst[0].c;
var insamechr=true;
for(var i=1; i<showcount; i++) {
	if(genelst[i].c!=chr) {
		insamechr=false; break;
	}
}

var w=200, h=11; // canvas size
if(insamechr) {
	// get left/right most coord
	var start=genelst[0].a, stop=genelst[0].b;
	for(i=1; i<showcount; i++) {
		start=Math.min(start,genelst[i].a);
		stop=Math.max(stop,genelst[i].b);
	}
	var sf=w/(stop-start);
	// first row is header
	var tr=table.insertRow(-1);
	var td=tr.insertCell(0);
	td.align='center';
	td.innerHTML=chr;
	var td=tr.insertCell(-1);
	var c=dom_create('canvas',td);
	c.width=w;
	c.height=10;
	var ctx=c.getContext('2d');
	ctx.fillStyle=colorCentral.foreground;
	ctx.fillRect(0,0,1,10);
	ctx.fillRect(w-1,0,1,10);
	ctx.fillRect(0,9,w,1);
	ctx.fillText(start, 3,8);
	var w2=ctx.measureText(stop.toString()).width;
	ctx.fillText(stop,w-w2-3,8);
	tr.insertCell(-1);
	tr.insertCell(-1);
	for(i=0; i<showcount; i++) {
		var g=genelst[i];
		var tr=table.insertRow(-1);
		tr.className='clb_o';
		tr.onclick=callback(g);
		tr.addEventListener('click', callback, false);
		tr.idx=i;
		var td=tr.insertCell(0)
		td.align='right';
		td.innerHTML=g.type;
		td=tr.insertCell(-1);
		var c=dom_create('canvas',td);
		c.width=w;
		c.height=h;
		var ctx=c.getContext('2d');
		plotGene(ctx,'#956584','white',
			{start:g.a,stop:g.b,strand:g.strand,struct:g.struct},
			(g.a-start)*sf,
			0,
			sf*(g.b-g.a),
			h,
			g.a,g.b,false);
		td=tr.insertCell(-1);
		td.innerHTML=g.a+'-'+g.b;
		if(g.desc) {
			td=tr.insertCell(-1);
			td.style.fontSize=10;
			td.innerHTML=g.desc.length>100?(g.desc.substr(0,100)+'...'):g.desc;
		}
	}
} else {
	// get max width of these genes for plotting
	var maxbp=0;
	for(var i=0; i<showcount; i++) {
		maxbp=Math.max(maxbp,genelst[i].b-genelst[i].a);
	}
	var sf=w/maxbp;
	for(i=0; i<showcount; i++) {
		var g=genelst[i];
		var tr=table.insertRow(-1);
		tr.className='clb_o';
		tr.onclick=callback(g);
		tr.idx=i;
		var td=tr.insertCell(0)
		td.align='right';
		td.innerHTML=g.type;
		td=tr.insertCell(-1);
		var c=dom_create('canvas',td);
		c.width=w;
		c.height=h;
		var ctx=c.getContext('2d');
		plotGene(ctx,'#956584','white',
			{start:g.a,stop:g.b,strand:g.strand,struct:g.struct},
			0,0,sf*(g.b-g.a),h,g.a,g.b,false);
		td=tr.insertCell(-1);
		td.innerHTML=g.c+':'+g.a+'-'+g.b;
		if(g.desc) {
			td=tr.insertCell(-1);
			td.innerHTML=g.desc.length>100?(g.desc.substr(0,100)+'...'):g.desc;
		}
	}
}
}

Browser.prototype.tkpanelheight=function()
{
return this.hmdiv.clientHeight+this.ideogram.canvas.height+this.decordiv.clientHeight;
}

Browser.prototype.migratedatafromgenome=function()
{
/* migrate data from genome to browser, no ajax
genome must be already built
supposed to be called after genome object is built
*/
if(this.genome.geneset) {
	this.genome.geneset.textarea_submitnew.value=this.genome.defaultStuff.gsvlst;
}
if(apps.scp && apps.scp.textarea) {
	apps.scp.textarea.value=this.genome.defaultStuff.gsvlst;
}
}

Browser.prototype.cleanuphtmlholder=function()
{
/* do this before restoring status or changing genome */
// gene set
if(this.genome.geneset) {
	stripChild(this.genome.geneset.lstdiv,0);
}
// hmtk
for(var n in this.genome.hmtk) {
	var t=this.genome.hmtk[n];
	if(t.public) continue;
	if(isCustom(this.genome.hmtk[n].ft)) {
		delete this.genome.hmtk[n];
	}
}
this.tklst=[];
if(this.hmheaderdiv) {
	stripChild(this.hmheaderdiv, 0);
}
stripChild(this.hmdiv, 0);
//stripChild(this.pwc.grp1, 0);
//stripChild(this.pwc.grp2, 0);
this.pwc.gtn1 = [];
this.pwc.gtn2 = [];

this.genome.custtk.names=[];

// decor
stripChild(this.decordiv,0);
if(this.decorheaderdiv) {
	stripChild(this.decorheaderdiv,0);
}

// mcm
if(this.mcm) {
	this.mcm.lst=[];
	stripChild(this.mcm.holder.firstChild.firstChild, 0);
	stripChild(this.mcm.tkholder, 0);
}

// session
apps.session.url_holder.style.display='none';

// splinters
this.splinters={};
stripChild(this.splinterHolder.firstChild.firstChild,0);
this.init_hmSpan();
this.applyHmspan2holders();

// misc
this.notes=[];

/* bev cleanup
var lst = document.getElementById("bev_dataregistry").firstChild.childNodes;
for(var i=0; i<lst.length; i++)
	delete bev.data[lst[i].vectorname];
stripChild(document.getElementById("bev_dataregistry").firstChild, 0);
for(var cn in bev.genomeCanvasTd)
	stripChild(bev.genomeCanvasTd[cn], 0);
	*/
this.turnoffJuxtapose(false);
}

function browser_table_mover(event)
{
/* must not use onmouseover=function(){gflag.browser=bbj;}
since that will make splinters unreachable
*/
var d=event.target;
while(!d.ismaintable) d=d.parentNode;
gflag.browser=d.bbj;
}

Browser.prototype.browser_makeDoms=function(param)
{
/* leftColumnWidth must be set prior to this
*/
this.minTkheight=param.mintkheight?param.mintkheight:10;
if(param.centralholder) {
	// cottonbbj has no visible main
	param.centralholder.style.position='relative';
	stripChild(param.centralholder,0);
}
var o_test=false;
var table=dom_create('table', param.centralholder,param.mainstyle);
table.cellPadding=table.cellSpacing=0;

var bbj=this;
/* must not use onmouseover=function(){gflag.browser=bbj;}
since that will make splinters unreachable
*/
table.ismaintable=true;
table.onmouseover=browser_table_mover;
table.horcrux=this.horcrux;
table.bbj=this;
this.main=table;
/***** row 1 ******/
var tr=table.insertRow(0);
var td=tr.insertCell(0); // 1
td.colSpan=4; // for the splinter holder
if(param.header) {
	this.header={};
	td.vAlign='top';
	td.align='center';
	td.style.color=param.header.fontcolor?param.header.fontcolor:colorCentral.foreground_faint_5;
	td.style.whiteSpace='nowrap';
	td.style.fontSize=param.header.fontsize;
	if(param.header.bg) td.style.backgroundColor=param.header.bg;
	if(param.header.height) td.style.height=param.header.height;
	if(param.header.padding) td.style.padding=param.header.padding;

	// navigation buttons
	var dspbutt=null;
	if(param.header.dspstat) {
		var u=param.header.dspstat.allowupdate;
		dspbutt={text:'<span style="background-color:#545454;color:white;padding:5px;">LOADING...</span>',attr:{allowupdate:u},call:function(e){bbj.clicknavibutt({d:e.target});}};
		if(!u) {
			// no updating butt
			dspbutt.text='position';
		}
	}
	var buttlst=[];
	if(dspbutt) {
		buttlst.push(dspbutt);
	}
	buttlst.push({text:'&#10010;',pad:true,call:browser_zoomin,attr:{fold:2,title:'zoom in 1 fold'}});
	for(var i=0; i<param.header.zoomout.length; i++) {
		var v=param.header.zoomout[i];
		buttlst.push({text:'&#9473;'+(param.header.zoomout.length==1?'':v[0]),pad:true,
			call:browser_zoomout,
			attr:{fold:v[1],title:'zoom out '+v[1]+' fold'}});
	}
	buttlst.push({text:'&#9664;',call:browser_pan,
		attr:{direction:'l',fold:1,title:'pan left'}});
	buttlst.push({text:'&#9654;',call:browser_pan,
		attr:{direction:'r',fold:1,title:'pan right'}});
	this.header_naviholder=dom_addrowbutt(td,buttlst,undefined,colorCentral.background_faint_5);
	if(!this.trunk) {
		this.header_naviholder.style.zoom=1.2;
	}
	if(dspbutt) {
		var b=this.header_naviholder.firstChild.firstChild.firstChild;
		this.header_dspstat=b;
		if(param.header.dspstat.tinyfont) {
			b.style.fontSize=param.header.dspstat.tinyfont;
		}
	}

	if(param.header.resolution) {
		var s=dom_addtext(td);
		this.header_resolution=s;
		s.style.margin='0px 10px';
	}

	if(param.header.utils) {
		var blst=[];
		if(param.header.utils.track) {
			blst.push({text:'Tracks',pad:true,call:grandaddtracks,});
			if(param.header.utils.track.no_publichub) {
				this.header.no_publichub=true;
			}
			if(param.header.utils.track.no_custtk) {
				this.header.no_custtk=true;
			}
			if(param.header.utils.track.no_number) {
				this.header.no_number=true;
			}
		}
		if(param.header.utils.apps) {
			blst.push({text:'Apps',pad:true,call:launchappPanel});
		}
		if(param.header.utils.print) {
			blst.push({text:'&#9113;',pad:true,call:param.header.utils.print});
		}
		if(param.header.utils.link) {
			blst.push({text:'&#8689;',pad:true,call:param.header.utils.link});
		}
		if(param.header.utils.bbjconfig) {
			blst.push({text:'&#9881;',pad:true,call:menu_bbjconfig_show});
		}
		if(param.header.utils.delete) {
			blst.push({text:'&#10005;',pad:true,call:param.header.utils.delete});
		}
		this.header_utilsholder=dom_addrowbutt(td,blst,'margin-left:20px;',colorCentral.background_faint_5);
		if(!this.trunk) {
			this.header_utilsholder.style.zoom=1.2;
		}
	}
}
/***** row 2 ******/
tr=table.insertRow(-1);
td=tr.insertCell(0); // 2-1
if(o_test) td.innerHTML=2;
td=tr.insertCell(-1); // 2-2,3
td.colSpan=2;
if(param.navigator) {
	var c=dom_create('canvas',td);
	c.className='opaque5';
	c.width=this.hmSpan;
	c.height=0;
	this.navigator.canvas=c;
	this.navigator.show_ruler=param.navigator_ruler;
	c.addEventListener('mousemove',navigator_tooltip,false);
	c.addEventListener('mouseout',pica_hide,false);
	c.addEventListener('mousedown',navigatorMD,false);
} else {
	this.navigator=null;
}
td=tr.insertCell(-1); // 2-4
/***** row 3 ******/
tr=table.insertRow(-1);
td=tr.insertCell(0); // 3-1
if(o_test) td.innerHTML=3;
td=tr.insertCell(1); // 3-2
td.vAlign='bottom';
if(param.ghm_scale) {
	var d=dom_create('div',td);
	d.style.height=browser_scalebar_height;
	d.style.position='relative';
	this.scalebar.holder=d;
	var d2=dom_create('div',d);
	d2.style.position='absolute';
	d2.style.bottom=0;
	d2.style.left=352;
	d2.style.cursor='default';
	d2.innerHTML='80mpg';
	d2.addEventListener('mousedown',scalebarSliderMD,false);
	this.scalebar.says=d2;
	var c=dom_create('canvas',d);
	c.style.display='block';
	c.style.position='absolute';
	c.style.left=400;
	c.style.bottom=0;
	c.width=20;
	c.height=16;
	c.addEventListener('mousedown',scalebarSliderMD,false);
	c.addEventListener('mouseover',scalebarMover,false);
	c.addEventListener('mouseout',scalebarMout,false);
	this.scalebar.slider=c;
		{
		var ctx = c.getContext('2d');
		ctx.fillStyle = 'black';
		ctx.fillRect(0,3,1,c.height-5);
		ctx.fillRect(0,8,c.width,1);
		}
	c=dom_create('canvas',d);
	c.style.display='block';
	c.style.position='absolute';
	c.style.bottom=0;
	c.style.left=413;
	c.width=20;
	c.height=16;
	c.addEventListener('mousedown',scalebarArrowMD,false);
	c.addEventListener('mouseover',scalebarMover,false);
	c.addEventListener('mouseout',scalebarMout,false);
	this.scalebar.arrow=c;
	this.drawScalebarSlider();
	this.scalebararrowStroke();
} else {
	this.scalebar=null;
}
if(param.ghm_ruler) {
	var d=dom_create('div',td);
	d.className='scholder';
	d.style.height=20;
	var c=dom_create('canvas',d);
	c.height=0;
	c.width=this.hmSpan;
	c.style.position='absolute';
	c.onmousedown=zoomin_MD;
	c.onmousemove=browser_ruler_mover;
	c.onmouseout=pica_hide;
	this.rulercanvas=c;
} else {
	this.rulercanvas=null;
}
td=tr.insertCell(-1); // 3-3 the splinter holder!!
td.rowSpan=7;
td.vAlign='top';
if(!param.no_splinters) {
	var stb=dom_create('table',td);
	stb.cellSpacing=stb.cellPadding=0;
	stb.insertRow(0);
	this.splinterHolder=stb;
}
td=tr.insertCell(-1); // 3-4
if(param.mcm) {
	td.vAlign='bottom';
	this.mcm.headerholder_top=dom_create('div',td,'position:relative');
}
/***** row 4 ******/
tr=table.insertRow(-1);
td=tr.insertCell(0); // 4-1
if(o_test) td.innerHTML=4;
if(param.tkheader) {
	td.vAlign='top';
	this.hmheaderdiv=td;
} else {
	this.hmheaderdiv=null;
}
td=tr.insertCell(-1); // 4-2
td.vAlign='top';
var d=dom_create('div',td);
d.className='scholder';
var d2=dom_create('div',d);
d2.style.position='absolute';
d2.style.backgroundColor=param.hmdivbg;
d2.addEventListener('mousedown',viewboxMD,false);
d.appendChild(d2);
this.hmdiv=d2;
// there's no 4-3
td=tr.insertCell(-1); // 4-4
if(param.mcm) {
	this.mcm.tkholder=td;
	var t=dom_create('table');
	t.horcrux=this.horcrux;
	t.addEventListener('mouseover',mcmheader_mover,false);
	this.mcm.holder=t;
	t.cellPadding=t.cellSpacing=0;
	t.insertRow(0);
	if(!param.mcmfixposition) {
		t.style.position='absolute';
		t.style.left=0;
		t.attop=true;
	}
} else {
	this.mcm=null;
}
/***** row 5 ******/
tr=table.insertRow(-1);
td=tr.insertCell(0); // 5-1
if(o_test) td.innerHTML=5;
td.align='center';
td.vAlign='top';
var c=dom_create('canvas',td);
//c.width= td.style.width=this.leftColumnWidth;
c.height=12;
c.style.marginTop=2;
c.style.display='none';
this.basepairlegendcanvas=c;
td=tr.insertCell(-1); // 5-2
td.vAlign='top';
d=dom_create('div',td);
d.className='scholder';
d.style.marginBottom=2;
td.appendChild(d);
var d2=dom_create('div',d);
d2.style.position='absolute';
var d3=dom_create('div',d2);
d3.style.position='relative';
c=dom_create('canvas',d3);
c.style.marginBottom=3;
c.width=this.hmSpan;
c.height=20;
c.onmousedown=zoomin_MD;
c.onmousemove=browser_ruler_mover;
c.onmouseout=pica_hide;
this.ideogram.canvas=c;
td=tr.insertCell(-1); // 5-4
td.rowSpan=4;
if(this.mcm) {
	td.vAlign='top';
	this.mcm.headerholder_bottom=dom_create('div',td,'position:relative');
}
/***** row 6 not in use ******/
tr=table.insertRow(-1);
td=tr.insertCell(0); // 6-1
if(o_test) td.innerHTML=6;
c=dom_create('canvas',td);
c.style.display='none';
this.htest.header=c;
td=tr.insertCell(-1); // 6-2
d=dom_create('div',td);
d.className='scholder';
d.style.display='none';
this.htest.holder=d;
c=dom_create('canvas',d);
c.style.position='absolute';
this.htest.canvas=c;
/***** row 7 not in use ******/
tr=table.insertRow(-1);
td=tr.insertCell(0); // 7-1
if(o_test) td.innerHTML=7;
c=dom_create('canvas',td);
c.style.display='none';
this.pwc.header=c;
td=tr.insertCell(-1); // 7-2
d=dom_create('div',td);
d.className='scholder';
d.style.display='none';
this.pwc.holder=d;
td.appendChild(d);
c=dom_create('canvas',d);
c.style.position='absolute';
this.pwc.canvas=c;
/***** row 8 ******/
tr=table.insertRow(-1);
td=tr.insertCell(0); // 8-1
if(o_test) td.innerHTML=8;
if(param.tkheader) {
	td.vAlign='top';
	this.decorheaderdiv=td;
} else {
	this.decorheaderdiv=null;
}
td=tr.insertCell(-1); // 8-2
td.vAlign='top';
d=dom_create('div',td);
d.className='scholder';
d2=dom_create('div',d);
d2.style.position='absolute';
d2.addEventListener('mousedown',viewboxMD,false);
this.decordiv=d2;

this.shield=dom_create('div',param.centralholder,'position:absolute;top:0px;left:0px;');

if(param.facet) {
	this.facet={
		main:dom_create('div',null,'display:none;padding-top:25px;'),
		dim1:{mdidx:null,term:null},
		dim2:{mdidx:null,term:null},
		rowlst:[],
		collst:[],
		rowlst_td:[],
		collst_td:[],
		pending:{}, // a hash of tk names
	};
	// outmost div, no border
	var d=dom_create('div',this.facet.main,'display:table;margin:0px 20px 20px 0px;');
	// actual holder
	var d2=dom_create('div',d,'background-color:'+colorCentral.background_faint_7);
	var d3=dom_create('div',d2,'margin-bottom:15px;padding:10px 20px;background-color:'+colorCentral.foreground_faint_1+';border-bottom:solid 1px '+colorCentral.foreground_faint_3);
	dom_addtext(d3,'Row ');
	var s=dom_addtext(d3,'', null,'mdt_box');
	s.isrow=true;
	this.facet.dim1.dom=s;
	s.onclick=facet_dimension_show;
	s.style.marginRight=20;
	dom_addtext(d3,'Column ');
	var s=dom_addtext(d3,'', null, 'mdt_box');
	s.isrow=false;
	this.facet.dim2.dom=s;
	s.onclick=facet_dimension_show;
	this.facet.swapbutt=dom_create('div',d3,'display:none;margin-left:20px;',{t:'&#8646;',c:'mdt_box',clc:function(){bbj.facet_swap();},title:'swap row/column'});

	var d5=dom_create('div',d2,'margin:0px 15px;');
	this.facet.div1=d5;
	d5=dom_create('table',d2,'margin:0px 15px;');
	this.facet.div2=d5;
	d5.cellSpacing=3;
	d5.cellPadding=1;
	var s=dom_create('div',d2,'margin-left:15px;');
	s.className='button_warning';
	s.style.display='inline-block';
	s.innerHTML='Remove all';
	s.onclick=facet_removeall;
} else {
	this.facet=null;
}

if(param.gsv) {
this.genesetview = {
	flanking:{},
	ideogram_stroke:'#1F3D7A',
	ideogram_fill5:'#85E094', // 5' upstream
	ideogram_fill3:'#E39F91', // 3' downstream
	minichr_filla:'#a3a3a3',
	minichr_fillb:'#c96',
	minichr_text:'white',
	box_stroke:colorCentral.foreground_faint_5,
	lst:[], // item region [name, chr, start, stop, plotlen], this is ALL of them not merely in dsp
	lstsf:0, // scaling factor from bplen to plot len
	lstholder:null, // item list holder table
};
} else {
	this.genesetview=null;
}
}






Browser.prototype.splinterSynctkorder=function()
{
// called from trunk
for(var tag in this.splinters) {
	var spt=this.splinters[tag];
	var newlst=[];
	for(var j=0; j<this.tklst.length; j++) {
		var tk=spt.findTrack(this.tklst[j].name);
		tk.where=this.tklst[j].where;
		newlst.push(tk);
	}
	spt.tklst=newlst;
	spt.trackdom2holder();
}
}


function add_new_browser(param)
{
/* add new browser, in addition to existing *main* one
FIXME func comes from sukn
*/
// dspstat now shows genome name
gflag.dspstat_showgenomename=true;
for(var h in horcrux) {
	var b=horcrux[h];
	if(!b.splinterTag) {
		/* b is trunk
		in case of adding multiple new bbjs from golden, the bbj might be uninitiated
		so need to escape them
		*/
		if(b.regionLst.length==0) continue;
		b.updateDspstat();
	}
}
var hh=document.getElementById('additional_genomes_div');
var border=dom_create('div',hh,'margin-top:15px;margin-bottom:10px;border-top:solid 1px #a8a8a8;border-bottom:solid 1px white;background-color:#ccc;height:4px;');
var mholder=dom_create('div',hh);
var bbj=new Browser();
bbj.leftColumnWidth=param.leftColumnWidth;
bbj.hmSpan=param.hmSpan;
bbj.browser_makeDoms({
	centralholder:mholder,
	mintkheight:10,
	header:{
		padding:'0px 0px 10px 0px',
		fontsize:'normal',
		zoomout:[['&#8531;',0.3],[1,1],[5,5]],
		dspstat:{allowupdate:true},
		resolution:true,
		utils:{track:true,apps:true,bbjconfig:true,delete:sukn_bbj_delete},
		},
	navigator:true,
	navigator_ruler:true,
	hmdivbg:'white',
	ghm_scale:true,
	ghm_ruler:true,
	tkheader:true,
	mcm:true,
	gsselect:true,
	gsv:true,
	gsv_geneplot:true,
	facet:true,
	});
bbj.hmdiv.style.backgroundColor='white';
if(param.stickynote) {
	bbj.ideogram.canvas.oncontextmenu=menu_coordnote;
}
bbj.mcm.holder.attop = true; // tells if holder be placed on top or bottom of mcm
bbj.applyHmspan2holders();
// TODO make genomeparam configurable
bbj.loadgenome_initbrowser({
	dbname:param.genome,
	browserparam:param.browserparam,
	genomeparam:{gsm:true, custom_track:true},
});
}

function smooth_tkdata(obj)
{
if(!obj.data_raw) {
	/* for a smoothed tk, when splintering, splinter tk will lack data_raw
	*/
	obj.data_raw=obj.data;
}
obj.data=[];
var smooth=obj.qtc.smooth;
for(var j=0; j<obj.data_raw.length; j++) {
	var tmpv=[];
	for(var k=0; k<obj.data_raw[j].length; k++) {
		var v=obj.data_raw[j][k];
		if(isNaN(v) || v==Infinity || v==-Infinity) {
			tmpv.push(v);
		} else {
			var sum=0,count=0;
			for(var m=k-(smooth-1)/2; m<k+(smooth-1)/2; m++) {
				var v2=obj.data_raw[j][m];
				if(v2!=undefined && !isNaN(v2) && v2!=Infinity && v2!=-Infinity) {
					sum+=v2;
					count++;
				}
			}
			if(count==0) {
				tmpv.push(NaN);
			} else {
				tmpv.push(sum/count);
			}
		}
	}
	obj.data.push(tmpv);
}
}

/*** __base__ ends ***/





/*** __render__ ***/

function catetk_plot_base(data, cateInfo, startidx, stopidx, ctx, qtc,x,y,w,h,tosvg)
{
var s=[];
for(var i=startidx; i<=stopidx; i++) {
	var c=cateInfo[data[i]][1];
	if(c) {
		ctx.fillStyle=c;
		ctx.fillRect(x,y,w,h);
		if(tosvg) {
			s.push({type:svgt_rect,x:x,y:y,w:w,h:h,fill:c});
		}
	}
	x+=w;
}
if(tosvg) return s;
}

Browser.prototype.init_hmSpan=function()
{
var tobe = document.body.clientWidth-this.leftColumnWidth-100;
if(tobe < 800)
	this.hmSpan=800;
else
	this.hmSpan=parseInt(tobe/10) * 10; // well, just to cope with letter display
}

Browser.prototype.applyHmspan2holders=function()
{
if(this.navigator!=null) {
	// in case of using splinters, need to sum up splinter width
	var s=this.hmSpan;
	for(var tag in this.splinters) {
		s+=this.splinters[tag].hmSpan;
	}
	/* look through pending splinters (not working)
	for(var a in horcrux) {
		var b=horcrux[a];
		if(b.trunk && b.trunk.horcrux==this.horcrux) {
			s+=b.hmSpan;
		}
	}
	*/
	this.navigator.canvas.width=s-30;
}
if(this.scalebar!=null) {
	this.scalebar.holder.style.width=this.hmSpan;
}
if(this.rulercanvas!=null) {
	this.rulercanvas.parentNode.style.width=this.hmSpan;
}
this.hmdiv.parentNode.style.width=
this.decordiv.parentNode.style.width=
this.ideogram.canvas.parentNode.parentNode.style.width=this.hmSpan;
}

Browser.prototype.render_browser=function(tosvg)
{
/* render browser panel, all tracks and all the stuff must be ready
not including bev, circlet, ...
called for:
- initiating browser panel
- changedb
- restoring status
- change ghm width
*/

this.drawRuler_browser(tosvg);
this.drawTrack_browser_all();
this.drawMcm(tosvg);
this.mcmPlaceheader();
this.drawIdeogram_browser(tosvg);
this.scalebarSlider_fill();
this.drawNavigator();
}


Browser.prototype.tklst_yscale=function(tklst)
{
/* get Y-range from a group of tk
always use auto scale
this is from visual range only!
*/
var max=null, min=null, max2=null, min2=null;
/* max/min are not normalized, used for rendering
max2/min2 maybe normalized, used for label printing
*/
for(var i=0; i<tklst.length; i++) {
	var tk=tklst[i];
	if(tk.qtc.smooth && !tk.data) {
		/* this happens when loading cust tk in a group, with smooth window applied
		*/
		if(!tk.data_raw) fatalError('missing .data_raw: '+tk.name);
		tk.data=tk.data_raw;
	}
	var thv=this.get_tkyscale(tk);
	if(thv[0]==null || thv[1]==null) continue;
	if(max==null || thv[0]>max) max=thv[0];
	if(min==null || thv[1]<min) min=thv[1];
	// apply normalization
	var a=this.track_normalize(tk,thv[0]);
	var b=this.track_normalize(tk,thv[1]);
	if(max2==null || a>max2) max2=a;
	if(min2==null || b<min2) min2=b;
}
return [max, min, max2, min2];
}

Browser.prototype.track_normalize=function(tk,v)
{
/* normalize a value given rules in a track
TODO this is rpm/bp, apply other rules
*/
if(!tk.normalize) return v;
v=v*1000000/tk.normalize.total_mapped_reads;
if(this.entire.atbplevel) return v;
return v/=this.entire.summarySize;
}


Browser.prototype.tkgroup_setYscale=function(groupidx)
{
var g=this.tkgroup[groupidx];
if(g.scale!=scale_auto) {
	return;
}
var gtklst=[];
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if(t.group==groupidx) gtklst.push(t);
}
if(gtklst.length==0) {
	print2console('empty tk group '+groupidx,2);
	return;
}
var t=this.tklst_yscale(gtklst);
g.max=g.max_show=t[0];
g.min=g.min_show=t[1];
}

Browser.prototype.drawTrack_browser_all=function()
{
/**** track group
grouped tracks shares y scale
shared scale will only be computed here
but not when updating a single track
assume that this func will always be called for track updating

Note:
	can get Y scale directly from numerical tracks
	BUT hammock tracks need to be stacked first then get Y scale
*/
var bbj=this;
var callfromtrunk=false;
if(this.trunk) {
	/* if scrolling splinters, numerical track scale must be kept sync, must switch to trunk for calling
	*/
	var usescale=false;
	for(var i=0; i<this.tklst.length; i++) {
		var t=this.tklst[i];
		if(tkishidden(t) || t.cotton) continue;
		if(isNumerical(t) || t.mode==M_bar || t.ft==FT_matplot) {
			usescale=true;
			break;
		}
	}
	if(usescale) {
		bbj=this.trunk;
		callfromtrunk=true;
	}
}

// stack hammock tracks
for(var i=0; i<bbj.tklst.length; i++) {
	bbj.stack_track(bbj.tklst[i], 0);
}

if(callfromtrunk) {
	for(var h in bbj.splinters) {
		var b=bbj.splinters[h];
		for(var i=0; i<b.tklst.length; i++) {
			b.stack_track(b.tklst[i],0);
		}
	}
}
// prepare track groups
var gidxhash={};
for(var i=0; i<bbj.tklst.length; i++) {
	var gidx=bbj.tklst[i].group;
	if(gidx!=undefined) {
		gidxhash[gidx]=1;
	}
}
for(var gidx in gidxhash) {
	if(!bbj.tkgroup[gidx]) {
		/* on starting up, tkgroup not initiated yet
		may move this part to somewhere else?
		*/
		bbj.tkgroup[gidx]={scale:scale_auto};
	}
	bbj.tkgroup_setYscale(gidx);
}
for(var i=0; i<bbj.tklst.length; i++) {
	bbj.drawTrack_browser(bbj.tklst[i],false);
}
bbj.trackHeightChanged();
bbj.placeMovable(bbj.move.styleLeft);
if(callfromtrunk) {
	for(var h in bbj.splinters) {
		var b=bbj.splinters[h];
		b.trackHeightChanged();
		b.placeMovable(b.move.styleLeft);
	}
}
}





Browser.prototype.drawMcm=function()
{
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if(tkishidden(t)) continue;
	this.drawMcm_onetrack(t, false);
	t.atC.style.display= t.where==1 ? 'block' : 'none';
}
}



Browser.prototype.barplot_uniform=function(arg)
{
if(arg.start>=arg.stop) return [];
arg.x=this.cumoffset(arg.rid,arg.start);
arg.initcoord=arg.start;
var slst=[];
if(this.entire.atbplevel) {
	for(var i=arg.start; i<arg.stop; i++) {
		slst.push(arg.score);
	}
} else {
	var a=arg.start;
	while(a<arg.stop) {
		slst.push(arg.score);
		a+=this.regionLst[arg.rid][7];
	}
}
delete arg.score;
delete arg.start;
delete arg.stop;
arg.data=slst;
return this.barplot_base(arg);
}

Browser.prototype.barplot_base=function(arg)
{
/* if rid is undefined, won't apply weaving
*/
var data=arg.data,
	ctx=arg.ctx,
	colors=arg.colors,
	tk=arg.tk,
	ridx=arg.rid, // for weaver
	initcoord=arg.initcoord, // for weaver, given for barplot
	x=arg.x, // will be incremented by weaver insert
	y=arg.y,
	pheight=arg.h,
	pointup=arg.pointup,
	w=arg.w,
	tosvg=arg.tosvg;
var curveonly=false;
if(tk.qtc && tk.qtc.curveonly) {
	curveonly=true;
}

var insertlookup=null;
var thisregion=null;
if(this.weaver && ridx!=undefined) {
	// if ridx==-1, weaver won't apply
	thisregion=this.regionLst[ridx];
	if(initcoord==undefined) {
		initcoord=thisregion[3];
	}
	if(this.entire.atbplevel) {
		insertlookup= this.weaver.insert[ridx];
	} else {
		insertlookup={};
		for(var c in this.weaver.insert[ridx]) {
			insertlookup[c]=this.weaver.insert[ridx][c];
		}
	}
}
if(!w) {
	/* bar width for each data point, preset to 1 in bev
	w set to negative to indicate reverse alignment from cotton track
	*/
	w=this.entire.atbplevel?this.entire.bpwidth:1;
	if(thisregion && thisregion[8] && thisregion[8].item.hsp.strand=='-') {
		w=-w;
		// x already set to be position of r[3] on the right of region
	}
}
var max=tk.maxv,
	min=tk.minv;
if(!colors.p) colors.p='rgb(184,0,92)';
if(!colors.n) colors.n='rgb(0,79,158)';
if(!colors.pth) colors.pth=colors.p;
if(!colors.nth) colors.nth=colors.n;
var pr,pg,pb,nr,ng,nb;
var plothm=pheight<20;
if(plothm) {
	// heatmap instead of bars
	var _tmp=colorstr2int(colors.p);
	pr=_tmp[0];
	pg=_tmp[1];
	pb=_tmp[2];
	_tmp=colorstr2int(colors.n);
	nr=_tmp[0];
	ng=_tmp[1];
	nb=_tmp[2];
}
var svgdata=[];
for(var i=0; i<data.length; i++) {
	// for each data point
	var score=data[i];
	var bary=null, barh=null, barcolor=null,
		tipy=null, tipcolor=null;
	if(isNaN(score)) {
		// do nothing
	} else if(score==Infinity) {
		barcolor=colors.inf?colors.inf:'#b5b5b5';
		if(plothm) {
			barh=pheight;
			bary=y;
		} else {
			if(max>0 && min<0) {
				barh=pheight*max/(max-min);
				bary=pointup ? y : (y+pheight-barh);
			} else {
				bary=y;
				barh=pheight;
			}
		}
	} else if(score==-Infinity) {
		barcolor=colors.inf?colors.inf:'#b5b5b5';
		if(plothm) {
			barh=pheight;
			bary=y;
		} else {
			if(max>0 && min<0) {
				barh=pheight*(0-min)/(max-min);
				bary=pointup ? (y+pheight-barh) : y;
			} else {
				bary=y;
				barh=pheight;
			}
		}
	} else {
		if(max>0 && min<0) {
			if(score>=0) {
				if(plothm) {
					barh=pheight;
					bary=y;
					barcolor=score>max?colors.pth:('rgba('+pr+','+pg+','+pb+','+(score/max)+')');
				} else {
					barh=pheight*Math.min(score,max)/(max-min);
					barcolor=colors.p;
					bary = y+pheight*max/(max-min) - (pointup ? barh : 0);
					if(score>=max) {
						tipcolor=colors.pth;
						tipy= pointup ? y : y+pheight-2;
					}
				}
			} else {
				if(plothm) {
					barh=pheight;
					bary=y;
					barcolor=score<min?colors.nth:('rgba('+nr+','+ng+','+nb+','+(score/(min-max))+')');
				} else {
					barh=pheight*Math.max(score,min)/(min-max);
					barcolor=colors.n;
					bary = y+pheight*max/(max-min) - (pointup ? 0 : barh);
					if(score<=min) {
						tipcolor=colors.nth;
						tipy= pointup ? y+pheight-2 : y;
					}
				}
			}
		} else if(max>0) {
			// min max both >0
			barcolor=colors.p;
			if(score<min) {
			} else if(min>0 && score==min) {
				if(plothm) {
				} else {
					barh=1;
					bary=pointup ? y+pheight-1 : y;
				}
			} else {
				if(plothm) {
					barh=pheight;
					bary=y;
					barcolor=score>=max?colors.pth:'rgba('+pr+','+pg+','+pb+','+((score-min)/(max-min))+')';
				} else {
					barh=pheight*(Math.min(score,max)-min)/(max-min);
					bary= pointup ? (y+pheight-barh) : y;
					if(score>=max) {
						tipcolor=colors.pth;
						tipy= pointup ? y : y+pheight-2;
					}
				}
			}
		} else {
			// min max both <= 0
			// including case when both minmax=0
			barcolor=colors.n;
			if(score>max) {
			} else if(max<0 && score==max) {
				if(plothm) {
				} else {
					barh=1;
					bary=pointup ? y: y+pheight-1;
				}
			} else {
				if(plothm) {
					if(min==0 && max==0) {
						// case that both min max=0, draw nothing!
					} else {
						barh=pheight;
						bary=y;
						barcolor=score<=min?colors.nth:'rgba('+nr+','+ng+','+nb+','+((max-score)/(max-min))+')';
					}
				} else {
					barh=pheight*(max-Math.max(score,min))/(max-min);
					bary= pointup ? y : (y+pheight-barh);
					if(score<=min) {
						tipcolor=colors.nth;
						tipy= pointup ? y+pheight-2 : y;
					}
				}
			}
		}
	}
	// svg do not accept negative width
	var svgw=w<0?-w:w;
	var svgx=w<0?x+w:x;
	if(barh==null) {
		if(tosvg) {svgdata.push({type:svgt_no});}
	} else {
		if(colors.barbg) {
			ctx.fillStyle=colors.barbg;
			ctx.fillRect(x,y,w,pheight);
			if(tosvg) {
				svgdata.push({type:svgt_line,x1:svgx, y1:y, x2:svgx, y2:y+pheight, w:svgw, color:ctx.fillStyle});
			}
		}
		ctx.fillStyle = barcolor;
		ctx.fillRect(x, bary, w, curveonly? 2 : barh);
		if(tosvg) {
			svgdata.push({type:svgt_rect,x:svgx,y:bary,w:svgw,h:barh,fill:barcolor});
		}
	}
	if(tipy) {
		ctx.fillStyle = tipcolor;
		ctx.fillRect(x, tipy, w, 2);
		if(tosvg) {
			svgdata.push({type:svgt_rect,x:svgx,y:tipy,w:svgw,h:2,fill:tipcolor});
		}
	}
	x+=w;
	if(insertlookup) {
		// consider gap
		if(this.entire.atbplevel) {
			initcoord+=1;
			if(initcoord in insertlookup) {
				// negative w for reverse
				x+= insertlookup[initcoord]*this.entire.bpwidth * (w>0?1:-1);
			}
		} else {
			initcoord+=thisregion[7];
			for(var j=0; j<=parseInt(thisregion[7]); j++) {
				var thisbp=parseInt(initcoord+j);
				if(thisbp in insertlookup) {
					// negative w for reverse
					x+= insertlookup[thisbp]/thisregion[7] * (w>0?1:-1);
					delete insertlookup[thisbp];
				}
			}
		}
	}
}
if(tosvg) return svgdata;
}




Browser.prototype.tkplot_line=function(p)
{
/*
.x/y: start position
.w: unit width
.h: plot range height
.tk: {data:[], normalize:null}
*/
p.ctx.strokeStyle=p.color;
p.ctx.lineWidth=p.linewidth;
var svgdata=[];
var pasth=null;
var x=p.x;
var sf=p.h/(p.max-p.min);
p.ctx.beginPath();
for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	var stop=this.entire.atbplevel?(r[4]-r[3]):r[5];
	var w=p.w;
	var initcoord=r[3];
	if(r[8]) {
		if(r[8].item.hsp.strand=='-') {
			w=-w;
		}
		// disregard p.x, but must not use [8].canvasxoffset
		x=this.cumoffset(i,initcoord);
	}

	var insertlookup=null;
	if(this.weaver) {
		if(this.entire.atbplevel) {
			insertlookup= this.weaver.insert[i];
		} else {
			insertlookup={};
			for(var c in this.weaver.insert[i]) {
				insertlookup[c]=this.weaver.insert[i][c];
			}
		}
	}

	for(var j=0; j<stop; j++) {
		var v=p.tk.data[i][j];
		if(isNaN(v)) {
			pasth=null;
		} else {
			v=this.track_normalize(p.tk,v);
			var h=sf*(v-p.min);
			var b, // past bar y
				d; // current bar y
			if(p.pointup) {
				b=p.y+p.h-pasth;
				d=p.y+p.h-h;
			} else {
				b=p.y+pasth;
				d=p.y+h;
			}
			if(pasth!=null) {
				p.ctx.moveTo(x,b);
				p.ctx.lineTo(x,d);
				if(p.tosvg) svgdata.push({type:svgt_line,x1:x,y1:b,x2:x,y2:d,color:p.color,w:p.linewidth});
			}
			p.ctx.moveTo(x,d);
			p.ctx.lineTo(x+w,d);
			if(p.tosvg) svgdata.push({type:svgt_line,x1:x,y1:d,x2:x+w,y2:d,color:p.color,w:p.linewidth});
			pasth=h;
		}
		x+=w;

		if(insertlookup) {
			if(this.entire.atbplevel) {
				initcoord+=1;
				if(initcoord in insertlookup) {
					// negative w for reverse
					x+= insertlookup[initcoord]*this.entire.bpwidth * (w>0?1:-1);
				}
			} else {
				initcoord+=r[7];
				for(var k=0; k<=parseInt(r[7]); k++) {
					var thisbp=parseInt(initcoord+k);
					if(thisbp in insertlookup) {
						// negative w for reverse
						x+= insertlookup[thisbp]/r[7] * (w>0?1:-1);
						delete insertlookup[thisbp];
					}
				}
			}
		}

	}
	x+=regionSpacing.width;
}
p.ctx.stroke();
if(p.tosvg) return svgdata;
}

function printbp_scrollable(ctx,b,x,y,w,h,tosvg)
{
var bp=b.toLowerCase();
if(!(bp in ntbcolor)) return [];
ctx.fillStyle = ntbcolor[bp];
ctx.fillRect(x, y, w, h);
var svgdata=[];
if(tosvg) svgdata.push({type:svgt_rect,x:x,y:y,w:w,h:h,fill:ctx.fillStyle});
if(w >= MAXbpwidth) {
	ctx.fillStyle = 'white';
	ctx.font = w>=MAXbpwidth_bold ? "bold 10pt Sans-serif" : "8pt Sans-serif";
	var y2=y+h/2+4;
	ctx.fillText(b, x, y2);
	if(tosvg) svgdata.push({type:svgt_text,x:x,y:y2,text:b,color:ctx.fillStyle});
}
return svgdata;
}

Browser.prototype.seq2ideogram=function(data)
{
if(!data) {
	data={abort:'Server error when fetching sequence'};
}
var svgdata=[];
var canvas=this.ideogram.canvas;
canvas.height=canvas.parentNode.parentNode.parentNode.style.height = ideoHeight + cbarHeight;
var ctx = canvas.getContext('2d');
if(data.abort) {
	var s=data.abort;
	var sp=this.hmSpan/2-this.move.styleLeft-ctx.measureText(s).width/2;
	ctx.fillText(s,sp,14);
	return;
}
if(!data.lst) fatalError('.lst missing');
var seqlst = data.lst;
for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	var s = data.lst[i];
	if(!s || s=='ERROR') {
		ctx.fillStyle='black';
		ctx.fillRect(this.cumoffset(i,r[3]),0,this.bp2sw(i,r[4]-r[3]),ideoHeight);
		continue;
	}
	for(var j=0; j<s.length; j++) {
		var _x=this.cumoffset(i,r[3]+j);
		// beware that cumoffset treats gap to be after the coord, but need to flip it!!
		if(this.weaver) {
			var _g=this.weaver.insert[i][r[3]+j];
			if(_g) _x+=_g*this.entire.bpwidth;
		}
		if(_x>=0) {
			var _s=printbp_scrollable(ctx,s[j],_x,0,this.entire.bpwidth,ideoHeight,true);
			svgdata=svgdata.concat(_s);
		}
	}
}
if(this.basepairlegendcanvas) {
	this.basepairlegendcanvas.style.display='block';
	this.drawATCGlegend(false);
}
this.draw_coordnote();
this.ideogram.svgdata=svgdata;
}


Browser.prototype.drawIdeogram_browser=function(tosvg)
{
if(!this.ideogram.canvas) return;
// different run mode get various graph, they override each other
this.ideogram.canvas.width=this.entire.spnum;
this.ideogram.canvas.height=
this.ideogram.canvas.parentNode.parentNode.parentNode.style.height=ideoHeight+cbarHeight;
if(this.basepairlegendcanvas) {
	this.basepairlegendcanvas.style.display = "none";
}
var ctx = this.ideogram.canvas.getContext('2d');
var svgdata=[];

if(this.genome.temporal_ymd) {
	// at day-precision, draw boxes of month
	ctx.fillStyle=colorCentral.foreground;
	var x=0; // month offset
	var x2=0; // year offset
	var lastyear=null;
	for(var i=0; i<this.regionLst.length; i++) {
		var r=this.regionLst[i];
		var w=r[5];
		ctx.fillRect(x+w,2,1,ideoHeight-4);
		if(tosvg) svgdata.push({type:svgt_line,x1:x+w,y1:2,x2:x+w,y2:ideoHeight-4});
		var mh=parseInt(r[1]/100);
		var w2=ctx.measureText(month2str[mh]).width;
		var q=x+w/2-w2/2;
		if(w2+20<=w) {
			ctx.fillText(month2str[mh],q,10);
			if(tosvg) svgdata.push({type:svgt_text,x:q,y:10,text:month2str[mh]});
		} else {
			w2=ctx.measureText(month2sstr[mh]).width;
			if(w2+20<=w) {
				q=x+w/2-w2/2;
				ctx.fillText(month2sstr[mh],q,10);
				if(tosvg) svgdata.push({type:svgt_text,x:q,y:10,text:month2str[mh]});
			}
		}
		if(lastyear==null) {
			lastyear=r[0];
		} else if(r[0]!=lastyear) {
			var q=x2-regionSpacing.width;
			ctx.fillRect(q,ideoHeight,1,8);
			if(tosvg) svgdata.push({type:svgt_line, x1:q,y1:ideoHeight,x2:q,y2:ideoHeight+8});
			w2=ctx.measureText(lastyear).width;
			if(w2+10<=x-x2) {
				ctx.fillText(lastyear,x2+(x-x2)/2-w2/2,this.ideogram.canvas.height);
				if(tosvg) svgdata.push({type:svgt_text,x:x2+(x-x2)/2-w2/2,y:this.ideogram.canvas.height,text:lastyear});
			}
			lastyear=r[0];
			x2=x;
		}
		x+=w+regionSpacing.width;
	}
	w2=ctx.measureText(lastyear).width;
	if(w2+10<=x-x2) {
		ctx.fillText(lastyear,x2+(x-x2)/2-w2/2,this.ideogram.canvas.height);
		if(tosvg) svgdata.push({type:svgt_text,x:x2+(x-x2)/2-w2/2,y:this.ideogram.canvas.height,text:lastyear});
	}
	return svgdata;
}
if(this.juxtaposition.type==RM_protein) {
	// render without protein sequence
	return;
}
if(this.entire.atbplevel) {
	/*** query and display chromosomal sequence */
	var lst = [];
	// querying seq for all regions, instead of those within wings
	for(var i=0; i<this.regionLst.length; i++) {
		var r=this.regionLst[i];
		lst.push(r[0]);
		lst.push(r[3]);
		lst.push(r[4]);
	}
	if(this.basepairlegendcanvas) {
		this.basepairlegendcanvas.style.display = "block";
		this.drawATCGlegend(true);
	}
	var bbj=this;
	if(this.genome.scaffold.fileurl) {
		this.ajax('getChromseq=on&url='+this.genome.scaffold.fileurl+'&regionlst='+lst.join(',')+this.genome.customgenomeparam(), function(data){bbj.seq2ideogram(data);});
	} else if(!this.genome.iscustom && !this.genome.noblastdb) {
		this.ajax('getChromseq=on&regionlst='+lst.join(',')+'&dbName='+this.genome.name, function(data){bbj.seq2ideogram(data);});
	}
	return;
}
if(this.is_gsv()) {
	/* gsv, drawing stack of boxes to indicate items
	item names are hidden if they are wider than the box
	*/
	ctx.font = "8pt Sans-serif";
	for(var i=0; i<this.regionLst.length; i++) {
		var r = this.regionLst[i];
		// check if to paint flank
		var fcoord=this.genesetview.flanking[r[6]];
		if(fcoord && fcoord.a5>=0 && fcoord.b5>=0) {
			// has 5' flank
			var s=this.tkcd_box({
				ctx:ctx,
				rid:i,
				start:fcoord.a5,
				stop:fcoord.b5,
				y:0.5,
				h:ideoHeight-1,
				fill:this.genesetview.ideogram_fill5,
				nojoin:true,
				tosvg:tosvg,});
			if(tosvg) svgdata=svgdata.concat(s);
		}
		if(fcoord && fcoord.a3>=0 && fcoord.b3>=0) {
			// has 3' flank
			var s=this.tkcd_box({
				ctx:ctx,
				rid:i,
				start:fcoord.a3,
				stop:fcoord.b3,
				y:0.5,
				h:ideoHeight-1,
				fill:this.genesetview.ideogram_fill3,
				nojoin:true,
				tosvg:tosvg,});
			if(tosvg) svgdata=svgdata.concat(s);
		}
		// bigbox
		var s=this.tkcd_box({
			ctx:ctx,
			rid:i,
			start:r[3],
			stop:r[4],
			y:0.5,
			h:ideoHeight-1,
			edge:this.genesetview.ideogram_stroke,
			text:r[6],
			texty:10,
			tosvg:tosvg,});
		if(tosvg) svgdata=svgdata.concat(s);
	}
	this.draw_coordnote();
	return svgdata;
}

/* cytoband */
ctx.font = "bold 8pt Sans-serif";
for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	var chrcy=this.genome.cytoband[r[0]];
	if(chrcy) {
		for(var j=0; j<chrcy.length; j++) {
			var cy = chrcy[j];
			if(Math.max(r[3], cy[0]) < Math.min(r[4], cy[1])) {
				var a=cytoBandColor[cy[2]], b=cytoWordColor[cy[2]];
				var s=this.tkcd_box({ctx:ctx,rid:i,
					start:cy[0],
					stop:cy[1],
					y:0,
					h:ideoHeight,
					fill:'rgb('+a+','+a+','+a+')',
					nojoin:true,
					text:cy[3],
					textcolor:'rgb('+b+','+b+','+b+')',
					texty:10,
					tosvg:tosvg,
				});
				if(tosvg) svgdata=svgdata.concat(s);
			}
		}
		var s=this.tkcd_box({ctx:ctx,rid:i,
			start:r[3],
			stop:r[4],
			y:.5,
			h:ideoHeight-1,
			edge:colorCentral.foreground,
			tosvg:tosvg,
		});
		if(tosvg) svgdata=svgdata.concat(s);
	} else {
		var s=this.tkcd_box({ctx:ctx,rid:i,
			text:'no cytoband data',
			edge:colorCentral.foreground_faint_5,
			y:.5,
			h:ideoHeight-1,
			start:r[3],
			stop:r[4],
			texty:10,
		});
		if(tosvg) svgdata=svgdata.concat(s);
	}
}

// plot chr name on second row, merging same chr names for adjacent regions
ctx.fillStyle = colorCentral.foreground;
// chr of first region
var previouschrname = this.regionLst[0][0];
var previouschrstart = 0;
var xoffset = this.cumoffset(0,this.regionLst[0][4]);
var y = ideoHeight + 2;
for(i=1; i<this.regionLst.length; i++) {
	var thisr=this.regionLst[i];
	if(previouschrname != thisr[0]) {
		// plot previous chr name
		var w = ctx.measureText(previouschrname).width;
		if(w < xoffset-previouschrstart) {
			var q=previouschrstart+(xoffset-previouschrstart-w)/2;
			ctx.fillText(previouschrname, q, y+7);
			if(tosvg) svgdata.push({type:svgt_text,x:q,y:y+7,text:previouschrname});
		}
		var a=xoffset,
			b=ideoHeight+2,
			c=ideoHeight+cbarHeight-2;
		ctx.fillRect(a, b, 1, c);
		if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:b,x2:a,y2:b+c});
		previouschrname = thisr[0];
		previouschrstart = xoffset;
	}
	xoffset = this.cumoffset(i,thisr[4]);
}
// last chr
var a=xoffset-1,
	b=ideoHeight+2,
	c=ideoHeight+cbarHeight-2;
ctx.fillRect(a, b, 1, c);
if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:b,x2:a,y2:b+c});
var w = ctx.measureText(previouschrname).width;
if(w < xoffset-previouschrstart) {
	a=previouschrstart+(xoffset-previouschrstart-w)/2;
	ctx.fillText(previouschrname, a, y+7);
	if(tosvg) svgdata.push({type:svgt_text,x:a,y:y+7,text:previouschrname});
}
this.draw_coordnote();
return svgdata;
}





Browser.prototype.tkcd_item=function(arg)
{
// tk canvas draw singular item, within one region
// TODO irrespective of full/thin, adjust by thickness value
var item=arg.item,
	y=arg.y,
	stackHeight=arg.stackHeight,
	ctx=arg.ctx,
	tosvg=arg.tosvg;
var svgdata=[];
var thisregion=this.regionLst[arg.region_idx];

var regioninsert={};
if(this.weaver) {
	regioninsert=this.weaver.insert[arg.region_idx];
}

// need method of computing anti color against arg.bedcolor
arg.anticolor=colorCentral.background;

if(arg.tkobj.ft==FT_weaver_c) {
	// must be target bbj drawing weavertk in fine mode
	if(item.hsp.targetstart>=item.hsp.targetstop) {
		print2console(arg.tkobj.cotton+' hsp start>stop',2);
		return [];
	}
	var s=this.tkcd_box({
		ctx:ctx,
		rid:arg.region_idx,
		start:item.hsp.targetstart,
		stop:item.hsp.targetstop,
		y:y,
		h:weavertkseqh,
		fill:weavertkcolor_target,
		tosvg:tosvg,
	});
	if(tosvg) svgdata=svgdata.concat(s);
	y+=weavertkseqh+weavertkalnh;

	var bpl=this.entire.atbplevel;
	var fvd=item.hsp.strand=='+';

	var x=x_0=this.cumoffset(arg.region_idx,item.hsp.targetstart);

	var incarr=this.weaver_gotgap(arg.region_idx);
	if(incarr.length>0) {
		var _l=[];
		for(var i=0; i<incarr.length; i++) {
			var ic=incarr[i];
			if(ic>item.hsp.targetstart && ic<item.hsp.targetstop) _l.push(ic);
		}
		incarr=_l;
	}
	var hspEnd=this.cumoffset(arg.region_idx,Math.min(thisregion[4],item.hsp.targetstop));
	item.hsp.canvasstart=x_0;
	item.hsp.canvasstop=hspEnd;

	/** query gap & insert **/
	// compare weaver.insert to hsp.insert, create extra gaps on hsp
	var _chew=item.hsp.chew_start;
	var _target=item.hsp.targetstart;
	var _query=fvd?item.hsp.querystart:item.hsp.querystop;
	var forcedgap=[];
	for(var i=0; i<incarr.length; i++) {
		var ic=incarr[i];
		// find chewid matching ic
		for(; _chew<item.hsp.targetseq.length; _chew++) {
			if(_target==ic) break;
			if(item.hsp.targetseq[_chew]!='-') _target++;
			if(item.hsp.queryseq[_chew]!='-') {
				_query+= fvd?1:-1;
			}
		}
		if(ic in item.hsp.insert) {
			var qinsert=item.hsp.insert[ic];
			if(qinsert<regioninsert[ic]) {
				var _w=regioninsert[ic]-qinsert;
				if(_query in item.hsp.gap) {
					item.hsp.gap[_query]+=_w;
				} else {
					item.hsp.gap[_query]=_w;
				}
				forcedgap.push(_query);
				// insert gap to both string
				var a=item.hsp.targetseq;
				var lst=[];
				for(var j=0; j<_w; j++) lst.push('-');
				item.hsp.targetseq= a.substr(0,_chew)+
					lst.join('')+
					a.substr(_chew);
				a=item.hsp.queryseq;
				lst=[];
				for(var j=0; j<_w; j++) lst.push('-');
				item.hsp.queryseq= a.substr(0,_chew)+
					lst.join('')+
					a.substr(_chew);
				_chew+=_w;

				item.hsp.insert[ic]=regioninsert[ic];
			}
		} else {
			// opens gap on query, needs query coord
			var _w=regioninsert[ic];
			var a=item.hsp.targetseq;
			var lst=[];
			for(var j=0; j<_w; j++) lst.push('-');
			item.hsp.targetseq= a.substr(0,_chew)+
				lst.join('')+
				a.substr(_chew);
			a=item.hsp.queryseq;
			lst=[];
			for(var j=0; j<_w; j++) lst.push('-');
			item.hsp.queryseq= a.substr(0,_chew)+
				lst.join('')+
				a.substr(_chew);
			_chew+=_w;

			item.hsp.insert[ic]=_w;
			if(_query in item.hsp.gap) {
				item.hsp.gap[_query]+=_w;
			} else {
				item.hsp.gap[_query]=_w;
			}
			forcedgap.push(_query);
		}
	}
	if(forcedgap.length>0) {
		/* made new gap into query,
		put that into .weaver.insert of the cottonbbj
		*/
		var bbj=this.weaver.q[arg.tkobj.cotton];
		for(var i=0; i<bbj.regionLst.length; i++) {
			var r=bbj.regionLst[i];
			if(r[8].item.id==item.id) {
				for(var j=0; j<forcedgap.length; j++) {
					var c=forcedgap[j];
					bbj.weaver.insert[i][c]=item.hsp.gap[c];
				}
				break;
			}
		}
	}

	ctx.fillStyle=arg.tkobj.qtc.bedcolor;
	var gcarr=[]; // these are query coord!
	for(var ic in item.hsp.gap) {
		gcarr.push(parseInt(ic));
	}
	if(gcarr.length>0) {
		gcarr.sort( fvd ? numSort : numSort2 );
		// strike through first...
		var a=y+weavertkseqh/2-.5;
		ctx.fillRect(x_0,a,hspEnd-x_0,1);
		if(tosvg) svgdata.push({type:svgt_line, x1:x_0,y1:a+.5, x2:hspEnd, y2:a+.5, w:1, color:ctx.fillStyle});
	}
	// if sufficient width for bp, will print bp, else print arrow
	var bpw=bpl?this.entire.bpwidth:(1/thisregion[7]);
	x=x_0;
	var prevcoord=fvd ? item.hsp.querystart : item.hsp.querystop;
	for(var i=0; i<gcarr.length; i++) {
		var gc=gcarr[i];
		var filld= fvd ? gc-prevcoord : prevcoord-gc;
		var fillw= this.bp2sw(arg.region_idx,filld);
		ctx.fillRect(x,y,fillw,weavertkseqh);
		if(tosvg) svgdata.push({type:svgt_rect,x:x,y:y,w:fillw,h:weavertkseqh,fill:ctx.fillStyle});
		if(bpw<MAXbpwidth) { // arrow
			var tmplst=decoritem_strokeStrandarrow(ctx, item.hsp.strand,
				x+2, fillw-4, y, weavertkseqh,
				arg.anticolor, tosvg);
			if(tosvg) svgdata=svgdata.concat(tmplst);
		}
		var gw=this.bp2sw(arg.region_idx, item.hsp.gap[gc]);
		x+=fillw+ gw;
		// bare arrow
		var tmplst=decoritem_strokeStrandarrow(ctx, item.hsp.strand,
			x-gw+2, gw-4, y, weavertkseqh,
			arg.tkobj.qtc.bedcolor, tosvg);
		if(tosvg) svgdata=svgdata.concat(tmplst);
		prevcoord=gc;
	}
	ctx.fillRect(x,y,hspEnd-x,weavertkseqh);
	if(tosvg) svgdata.push({type:svgt_rect,x:x,y:y,w:hspEnd-x,h:weavertkseqh,fill:ctx.fillStyle});
	if(bpw<MAXbpwidth) { // arrow
		var tmplst=decoritem_strokeStrandarrow(ctx, item.hsp.strand,
			x+2, hspEnd-x-4, y, weavertkseqh,
			arg.anticolor, tosvg);
		if(tosvg) svgdata=svgdata.concat(tmplst);
	}
	/** letters n mismatch **/
	var _target=item.hsp.targetstart,
		_query=fvd?item.hsp.querystart:item.hsp.querystop;
	for(var i=item.hsp.chew_start; i<item.hsp.targetseq.length; i++) {
		var t0=item.hsp.targetseq[i];
		var q0=item.hsp.queryseq[i];
		var a=x_0+bpw*(i-item.hsp.chew_start);
		if(t0!='-') {
			if(bpw >= MAXbpwidth) {
				ctx.fillStyle = 'white';
				ctx.font = "8pt Sans-serif";
				var b=arg.y+weavertkseqh-1;
				ctx.fillText(t0, a, b);
				if(tosvg) svgdata.push({type:svgt_text,x:a,y:b,text:t0,color:ctx.fillStyle});
			}
		}
		if(q0!='-') {
			if(bpw >= MAXbpwidth) {
				ctx.fillStyle = 'white';
				ctx.font = "8pt Sans-serif";
				var b=arg.y+weavertkseqh*2+weavertkalnh-1;
				ctx.fillText(q0, a, b);
				if(tosvg) svgdata.push({type:svgt_text,x:a,y:b,text:q0,color:ctx.fillStyle});
			}
		}
		var t=t0.toLowerCase();
		var q=q0.toLowerCase();
		if(t!='-' && q!='-' && t==q) {
			a+=bpw/2;
			var b=arg.y+weavertkseqh+1;
			var bh=weavertkalnh-2;
			ctx.fillStyle=colorCentral.foreground_faint_7;
			ctx.fillRect(parseInt(a),b,Math.min(1,bpw),bh);
			if(tosvg) svgdata.push({type:svgt_line,x1:a,y1:b,x2:a,y2:b+bh,w:Math.min(1,bpw),color:ctx.fillStyle});
		}
	}
	return svgdata;
}

if(item.sbstroke) {
	y+=1;
	stackHeight-=2;
}
var iname=item.name2?item.name2:item.name;
var fvd=(thisregion[8] && thisregion[8].item.hsp.strand=='-') ? false : true;

if(!item.struct) {
	/*****  full, no structure 
	including unmatched lr item
	*/
	var param= {
		ctx:ctx,
		rid:arg.region_idx,
		start:item.start,
		stop:item.stop,
		viziblebox:true,
		y:y,
		h:stackHeight,
		fill:arg.bedcolor,
		tosvg:tosvg,
	};
	if(item.strand && item.strand!='.') {
		param.strand=item.strand;
	}
	if(item.namestart!=undefined) {
		// print name
		param.text=iname;
		if(item.namewidth > item.boxwidth) {
			if(item.namestart<item.boxstart) {
				param.textonleft=true;
			} else {
				param.textonright=true;
			}
		}
	}
	var s=this.tkcd_box(param);
	if(tosvg) svgdata=svgdata.concat(s);
} else {
	/* full, has structure
	including paired lr item
	*/
	var middleY = stackHeight/2+y;
	if(arg.isChiapet) { // TODO merge into hammock
		if(item.boxwidth) {
			/* never forgot boxwidth could be undefined
			by Celso 2014/2/13
			*/
			ctx.fillStyle=arg.bedcolor;
			var L = item.struct.L;
			var R = item.struct.R;
			var rL=this.regionLst[L.rid],
				rR=this.regionLst[R.rid];
			var x1=this.cumoffset(L.rid,Math.min(rL[4],L.stop));
			var x2=this.cumoffset(R.rid,Math.max(rR[3],R.start));
			ctx.fillRect(x1,middleY,x2-x1,1);
			if(tosvg) svgdata.push({type:svgt_line,x1:x1,y1:middleY,x2:x2,y2:middleY,w:1,color:arg.bedcolor});
			var s=this.tkcd_box({
				ctx:ctx,
				rid:L.rid,
				start:Math.max(rL[3],L.start),
				stop:Math.min(rL[4],L.stop),
				viziblebox:true,
				y:y,
				h:stackHeight,
				fill:arg.bedcolor,
				tosvg:tosvg,
			});
			if(tosvg) svgdata=svgdata.concat(s);
			var s=this.tkcd_box({
				ctx:ctx,
				rid:R.rid,
				start:Math.max(rR[3],R.start),
				stop:Math.min(rR[4],R.stop),
				viziblebox:true,
				y:y,
				h:stackHeight,
				fill:arg.bedcolor,
				tosvg:tosvg,
			});
			if(tosvg) svgdata=svgdata.concat(s);
		}
	} else {
		// must not use plotGene
		var x0=this.cumoffset(arg.region_idx,Math.max(thisregion[3],item.start)),
			x9=this.cumoffset(arg.region_idx,Math.min(thisregion[4],item.stop));
		// strike through, careless about gap
		ctx.fillStyle = arg.bedcolor;
		var _y=y+stackHeight/2-.5;
		ctx.fillRect(x0,_y,x9-x0,1);
		if(tosvg) svgdata.push({type:svgt_line,x1:x0,y1:_y,x2:x9,y2:_y,w:1,color:ctx.fillStyle});

		var strand=item.strand?(item.strand=='.'?null:(item.strand=='>'||item.strand=='+')?'>':'<'):null;
		if(strand) {
			// draw invisible box for name and bare strand on strike
			var s=this.tkcd_box({
				ctx:ctx,
				rid:arg.region_idx,
				start:item.start,
				stop:item.stop,
				y:y,
				h:stackHeight,
				color:arg.bedcolor,
				strand:strand,
				tosvg:tosvg,
			});
			if(tosvg) svgdata=svgdata.concat(s);
		}

		if(item.struct && item.struct.thin) {
			for(var i=0; i<item.struct.thin.length; i++) {
				var t=item.struct.thin[i];
				var s=this.tkcd_box({
					ctx:ctx,
					rid:arg.region_idx,
					start:t[0],
					stop:t[1],
					nojoin:true,
					viziblebox:true,
					y:y+instack_padding,
					h:stackHeight-instack_padding*2,
					fill:arg.bedcolor,
					tosvg:tosvg,
				});
				if(tosvg) svgdata=svgdata.concat(s);
			}
		}
		if(item.struct && item.struct.thick) {
			for(var i=0; i<item.struct.thick.length; i++) {
				var t=item.struct.thick[i];
				var s=this.tkcd_box({
					ctx:ctx,
					rid:arg.region_idx,
					start:t[0],
					stop:t[1],
					nojoin:true,
					viziblebox:true,
					y:y,
					h:stackHeight,
					strand:strand,
					fill:arg.bedcolor,
					tosvg:tosvg,
				});
				if(tosvg) svgdata=svgdata.concat(s);
			}
		}
		var leftend=fvd?x0:x9,
			rightend=fvd?x9:x0;
		if(item.namestart && Math.max(leftend,-this.move.styleLeft)<Math.min(this.hmSpan-this.move.styleLeft,rightend)) {
			// item in view range, lay name at last
			var s=this.tkcd_box({
				ctx:ctx,
				rid:arg.region_idx,
				start:item.start,
				stop:item.stop,
				y:y,
				h:stackHeight,
				textcolor:arg.bedcolor,
				textboxnooverlap:true,
				text:iname,
				tosvg:tosvg,
			});
			if(tosvg) svgdata=svgdata.concat(s);
		}
	}
}
if(item.sbstroke && item.boxwidth>=5) {
	var uw=this.entire.atbplevel?this.entire.bpwidth:1;
	for(var k=0; k<item.sbstroke.length; k++) {
		var a=this.cumoffset(arg.region_idx,item.start+item.sbstroke[k]);
		if(a>=0) {
			ctx.fillStyle=arg.tkobj.qtc.strokecolor;
			ctx.fillRect(parseInt(a),y,uw,stackHeight);
			if(tosvg) svgdata.push({type:svgt_rect,x:a,y:y,w:uw,h:stackHeight,fill:ctx.fillStyle});
		}
	}
}
return svgdata;
}



Browser.prototype.tkcd_box=function(arg)
{
// singular item, no struct, within one region
var tosvg=arg.tosvg,
	ctx=arg.ctx,
	r=this.regionLst[arg.rid];
if(!r) return [];
arg.start=Math.max(r[3],arg.start);
arg.stop=Math.min(r[4],arg.stop);
if(arg.start>arg.stop) return [];
// deals with reverse-aligned hsp
var fvd= (r[8] && r[8].item.hsp.strand=='-') ? false : true;

var incarr=this.weaver_gotgap(arg.rid,fvd?false:true);
if(incarr.length>0) {
	var _l=[];
	for(var i=0; i<incarr.length; i++) {
		if(incarr[i]>arg.start && incarr[i]<arg.stop) _l.push(incarr[i]);
	}
	incarr=_l;
}
// x0 and x9 won't be changed
var x1=x0=this.cumoffset(arg.rid, fvd?arg.start:arg.stop);
/*
var x1,x0;
if(fvd) {
	x1=x0=this.cumoffset(arg.rid, arg.start);
} else {
	x1=x0=this.cumoffset(arg.rid, arg.stop-1,true);
}
*/
var x9=this.cumoffset(arg.rid, fvd?arg.stop:arg.start);
// arg.stop bp is not included
var s=[];
if(arg.fill) {
	ctx.fillStyle=arg.fill;
	for(var i=0; i<incarr.length; i++) {
		var x2=this.cumoffset(arg.rid,incarr[i]);
		var w=x2-x1;
		if(arg.viziblebox) {
			w=Math.max(1,w);
		}
		ctx.fillRect(x1,arg.y,w,arg.h);
		if(tosvg) s.push({type:svgt_rect,x:x1,y:arg.y,w:w,h:arg.h,fill:arg.fill});
		var gw=this.bp2sw(arg.rid,this.weaver.insert[arg.rid][incarr[i]]);
		if(!arg.nojoin) {
			var _y=parseInt(arg.y+arg.h/2);
			ctx.fillRect(x2,_y,gw,1);
			if(tosvg) s.push({type:svgt_line,x1:x2,y1:_y,x2:x2+gw,y2:_y,w:1,color:arg.fill});
		}
		x1=x2+ gw;
	}
	var w=x9-x1;
	if(arg.viziblebox) {
		w=Math.max(1,w);
	}
	ctx.fillRect(x1,arg.y,w,arg.h);
	if(tosvg) s.push({type:svgt_rect,x:x1,y:arg.y,w:w,h:arg.h,fill:arg.fill});
} else if(arg.edge) {
	ctx.strokeStyle=arg.edge;
	// left v
	ctx.moveTo(x1,arg.y);
	ctx.lineTo(x1,arg.y+arg.h);
	if(tosvg) s.push({type:svgt_line,x1:x1,y1:arg.y,x2:x1,y2:arg.y+arg.h});
	for(var i=0; i<incarr.length; i++) {
		var x2=this.cumoffset(arg.rid,incarr[i]);
		// top h
		ctx.moveTo(x1,arg.y);
		ctx.lineTo(x2,arg.y);
		if(tosvg) s.push({type:svgt_line,x1:x1,y1:arg.y,x2:x2,y2:arg.y});
		// bottom h
		var _y=arg.y+arg.h;
		ctx.moveTo(x1,_y);
		ctx.lineTo(x2,_y);
		if(tosvg) s.push({type:svgt_line,x1:x1,y1:_y,x2:x2,y2:_y});
		x1=x2+ this.bp2sw(arg.rid,this.weaver.insert[arg.rid][incarr[i]]);
	}
	// top h
	ctx.moveTo(x1,arg.y);
	ctx.lineTo(x9,arg.y);
	if(tosvg) s.push({type:svgt_line,x1:x1,y1:arg.y,x2:x9,y2:arg.y});
	// bottom h
	var _y=arg.y+arg.h;
	ctx.moveTo(x1,_y);
	ctx.lineTo(x9,_y);
	if(tosvg) s.push({type:svgt_line,x1:x1,y1:_y,x2:x9,y2:_y});
	// right v
	ctx.moveTo(x9,arg.y);
	ctx.lineTo(x9,_y);
	if(tosvg) s.push({type:svgt_line,x1:x9,y1:arg.y,x2:x9,y2:_y});
	ctx.stroke();
}
// priority: text > strand
var textstart=textstop=0; // only set value when text goes inside box
var leftend=x0, rightend=x9;
if(arg.text) {
	var w=ctx.measureText(arg.text).width;
	var ty=arg.texty?arg.texty:arg.y+10;
	if(arg.textboxnooverlap) {
		// should be item with struct
		ctx.fillStyle=arg.textcolor;
		if(leftend+this.move.styleLeft>=w+1) {
			// on left
			var a=leftend-w-1;
			ctx.fillText(arg.text,a,ty);
			if(tosvg) s.push({type:svgt_text,x:a,y:ty,text:arg.text,color:ctx.fillStyle});
		} else if(this.hmSpan-this.move.styleLeft-rightend>=w+1) {
			// on right
			ctx.fillText(arg.text,rightend+1,ty);
			if(tosvg) s.push({type:svgt_text,x:rightend+1,y:ty,text:arg.text,color:ctx.fillStyle});
		} else {
			// name forced into box, draw bg for name
			ctx.fillStyle=colorCentral.background_faint_7;
			var a=10+Math.max(-this.move.styleLeft,leftend);
			ctx.fillRect(a,arg.y,w+6,arg.h);
			if(tosvg) s.push({type:svgt_rect,x:a,y:arg.y,w:w+6,h:arg.h,fill:ctx.fillStyle});
			ctx.fillStyle=arg.textcolor?arg.textcolor:(arg.fill?arg.fill:arg.edge);
			ctx.fillText(arg.text,a+3,ty);
			if(tosvg) s.push({type:svgt_text,x:a,y:ty,text:arg.text,color:ctx.fillStyle});
		}
	} else {
		// should be item without struct
		if(arg.textonleft) {
			ctx.fillStyle=arg.textcolor?arg.textcolor:(arg.fill?arg.fill:arg.edge);
			var a=leftend-w-1;
			ctx.fillText(arg.text,a,ty);
			if(tosvg) s.push({type:svgt_text,x:a,y:ty,text:arg.text,color:ctx.fillStyle});
		} else if(arg.textonright) {
			ctx.fillStyle=arg.textcolor?arg.textcolor:(arg.fill?arg.fill:arg.edge);
			ctx.fillText(arg.text,rightend+1,ty);
			if(tosvg) s.push({type:svgt_text,x:rightend+1,y:ty,text:arg.text,color:ctx.fillStyle});
		} else if(w<rightend-leftend) {
			ctx.fillStyle=arg.textcolor?arg.textcolor:(arg.fill?'white':arg.edge);
			var a=(leftend+rightend-w)/2;
			ctx.fillText(arg.text,a,ty);
			// only set it here
			textstart=a;
			textstop=a+w;
			if(tosvg) s.push({type:svgt_text,x:a,y:ty,text:arg.text,color:ctx.fillStyle});
		}
	}
}
if(arg.strand) {
	x1=x0;
	for(var i=0; i<incarr.length; i++) {
		var x2=this.cumoffset(arg.rid,incarr[i]);
		var ss=plotstrandNameaside(ctx,
			x1,
			x2,
			arg.y,arg.h,
			fvd?arg.strand:((arg.strand=='+'||arg.strand=='>')?'-':'+'),
			arg.fill? colorCentral.background
				:(arg.edge?arg.edge:(arg.color?arg.color:colorCentral.foreground)),
			textstart,textstop,tosvg);
		if(tosvg) s=s.concat(ss);
		x1=x2+this.bp2sw(arg.rid,this.weaver.insert[arg.rid][incarr[i]]);
	}
	var ss=plotstrandNameaside(ctx,
		x1,
		x9,
		arg.y,arg.h,
		fvd?arg.strand:((arg.strand=='+'||arg.strand=='>')?'-':'+'),
		arg.fill? colorCentral.background
			:(arg.edge?arg.edge:(arg.color?arg.color:colorCentral.foreground)),
		textstart,textstop,tosvg);
	if(tosvg) s=s.concat(ss);
}
return s;
}

function plotstrandNameaside(ctx,x1,x2,y,h,strand,color,namestart,namestop,tosvg)
{
/* x1/x2: x start/stop of strand box
namestart/stop: x start/stop of existing name, use 0 if there's no name,
else strand will avoid name
*/
var s=[];
var a=x1+2, w=x2-x1-4;
if(namestart) {
	if(a<namestart) {
		if(x2>namestop) {
			// draw strand surrounding name
			w=namestart-4-a;
			var ss=decoritem_strokeStrandarrow(ctx, 
				strand,
				a, w, y, h,
				color, tosvg);
			if(tosvg) s=s.concat(ss);
			a=namestop+4;
			w=x2-a-2;
			ss=decoritem_strokeStrandarrow(ctx, 
				strand,
				a, w, y, h,
				color, tosvg);
			if(tosvg) s=s.concat(ss);
			return s;
		}
		// on left of name
		w=Math.min(x2,namestart-2)-a-2;
	} else {
		// on right of name
		a=Math.max(x1,namestop+2)+2;
		w=x2-a-2;
	}
}
s=decoritem_strokeStrandarrow(ctx, 
	strand,
	a, w, y, h,
	color, tosvg);
if(tosvg) return s;
}



Browser.prototype.drawATCGlegend=function(waiting)
{
var c=this.basepairlegendcanvas;
c.width=this.leftColumnWidth;
var ctx=c.getContext('2d');
ctx.clearRect(0,0,c.width,c.height);
if(waiting) {
	ctx.fillStyle=colorCentral.foreground_faint_5;
	ctx.font = "8pt Sans-serif";
	ctx.fillText('Loading sequence...',0,10);
	return;
}
ctx.fillStyle = ntbcolor.a;
ctx.fillRect(0,0,15,c.height);
ctx.fillStyle = ntbcolor.t;
ctx.fillRect(16,0,15,c.height);
ctx.fillStyle = ntbcolor.c;
ctx.fillRect(32,0,15,c.height);
ctx.fillStyle = ntbcolor.g;
ctx.fillRect(48,0,15,c.height);
ctx.fillStyle = ntbcolor.n;
ctx.fillRect(64,0,15,c.height);
ctx.fillStyle = "white";
ctx.font = "bold 10pt Sans-serif";
ctx.fillText("A", 3,10);
ctx.fillText("T", 19,10);
ctx.fillText("C", 35,10);
ctx.fillText("G", 51,10);
ctx.fillText("N", 67,10);
}





function make_skewbox_butt(holder)
{
var d=dom_create('div',holder);
d.className='skewbox_butt';
dom_create('div',d);
dom_create('div',d);
return d;
}

function make_controlpanel(param)
{
var main=dom_create('div');
main.style.position='absolute';
main.style.zIndex=100;
main.style.display='none';
if(param.bg) {main.style.backgroundColor=param.bg;}
var tableid=Math.random();
main.setAttribute('id',tableid);
// 1 header
var table=dom_create('table',main);
if(param.headerzoom) {
	table.style.zoom=param.headerzoom;
}
var tr=table.insertRow(0);
// 1 header text, draggable
var td=tr.insertCell(0);
td.setAttribute('holderid',tableid);
td.addEventListener('mousedown',cpmoveMD,false);
if(param.htextbg) {
	td.style.backgroundColor=param.htextbg;
}
var d=dom_create('div',td);
d.className='skewbox_header';
var d2=dom_create('div',d); // skew box
d2.style.borderColor=param.htextcolor?param.htextcolor:colorCentral.background_faint_7;
if(param.htextbg) {
	d2.style.backgroundColor=param.htextbg;
}
d2=dom_create('div',d); // text box
d2.style.padding=param.hpadding?param.hpadding:'2px 100px';
d2.style.color=param.htextcolor?param.htextcolor:colorCentral.background;
d2.innerHTML=param.htext;
main.__htextdiv=d2;
// 1 header butt
if(param.hbutt1) {
	var p=param.hbutt1;
	td=tr.insertCell(-1);
	td.style.paddingLeft='15px';
	d=make_skewbox_butt(td);
	if(p.title) d.title=p.title;
	if(p.call) d.addEventListener('click',p.call,false);
	d.firstChild.style.backgroundColor=p.bg?p.bg:(param.htextcolor?param.htextcolor:colorCentral.background);
	d.childNodes[1].style.color=p.fg?p.fg:colorCentral.foreground_faint_5;
	d.childNodes[1].innerHTML=param.hbutt1.text;
	main.__hbutt1=d;
}
if(param.hbutt2) {
	var p=param.hbutt2;
	td=tr.insertCell(-1);
	td.style.paddingLeft='15px';
	d=make_skewbox_butt(td);
	if(p.title) d.title=p.title;
	if(p.call) d.addEventListener('click',p.call,false);
	d.firstChild.style.backgroundColor=p.bg?p.bg:(param.htextcolor?param.htextcolor:colorCentral.background);
	d.childNodes[1].style.color=p.fg?p.fg:colorCentral.foreground_faint_5;
	d.childNodes[1].innerHTML=p.text;
	main.__hbutt2=d;
}
if(param.hbutt3) {
	var p=param.hbutt3;
	td=tr.insertCell(-1);
	td.style.paddingLeft='15px';
	d=make_skewbox_butt(td);
	if(p.title) d.title=p.title;
	if(p.call) d.addEventListener('click',p.call,false);
	d.firstChild.style.backgroundColor=p.bg?p.bg:(param.htextcolor?param.htextcolor:colorCentral.background);
	d.childNodes[1].style.color=p.fg?p.fg:colorCentral.foreground_faint_5;
	d.childNodes[1].innerHTML=p.text;
	main.__hbutt3=d;
}
// 2 contents
d=dom_create('div',main);
d.style.marginTop='20px';
d.style.position='relative';
main.__contentdiv=d;
return main;
}

function flip_panel(dom1,dom2,forward)
{
/* args:
dom1: the panel on far side,
dom2: the panel on near side
forward: boolean, if true will fade fardom and show neardom (hide 1, show 2)
*/
if(forward) {
	panelFadeout(dom1);
	panelFadein(dom2);
} else {
	panelFadeout(dom2);
	panelFadein(dom1);
}
}



function page_makeDoms(param)
{
if(gflag.__pageMakeDom_called) return;
gflag.__pageMakeDom_called=true;

// internal md
if(getmdidx_internal()==-1) {
	var ft=[
		FT2verbal[FT_bed_c],
		FT2verbal[FT_bedgraph_c],
		FT2verbal[FT_bigwighmtk_c],
		FT2verbal[FT_anno_c],
		FT2verbal[FT_bam_c],
		FT2verbal[FT_lr_c],
		FT2verbal[FT_cat_c],
		FT2verbal[FT_matplot],
		FT2verbal[FT_weaver_c],
		FT2verbal[FT_cm_c],
		FT2verbal[FT_ld_c]
		];
	var gn=[];
	for(var n in genome) gn.push(n);
	var v={
		vocabulary:{ 'Track type':ft, },
		tag:literal_imd,
	};
	v.vocabulary[literal_imd_genome]=gn;
	load_metadata_json(v);
}

/* prepare colors */
var s=colorstr2int(colorCentral.foreground).join(',');
colorCentral.foreground_faint_1='rgba('+s+',0.1)';
colorCentral.foreground_faint_2='rgba('+s+',0.2)';
colorCentral.foreground_faint_3='rgba('+s+',0.3)';
colorCentral.foreground_faint_5='rgba('+s+',0.5)';
colorCentral.foreground_faint_7='rgba('+s+',0.7)';
s=colorstr2int(colorCentral.background).join(',');
colorCentral.background_faint_1='rgba('+s+',0.1)';
colorCentral.background_faint_3='rgba('+s+',0.3)';
colorCentral.background_faint_5='rgba('+s+',0.5)';
colorCentral.background_faint_7='rgba('+s+',0.7)';
colorCentral.background_faint_9='rgba('+s+',0.9)';
// make copy of long color lst for restoring after user messed up mcm
var lst=[];
for(var i=0; i<colorCentral.longlst.length; i++) {
	lst.push(colorCentral.longlst[i]);
}
colorCentral.longlst_bk=lst;

if(param.highlight_color) {
	colorCentral.hl=param.highlight_color;
} else {
	colorCentral.hl=colorCentral.foreground_faint_1;
}

var f={};
f[FT_bed_n]=f[FT_bed_c]=f[FT_bedgraph_c]=f[FT_bedgraph_n]=f[FT_qdecor_n]=f[FT_cat_n]=f[FT_cat_c]=f[FT_bigwighmtk_c]=f[FT_bigwighmtk_n]=f[FT_anno_n]=f[FT_anno_c]=1;
ftfilter_ordinary=f;
f={};
f[FT_bedgraph_c]=f[FT_bedgraph_n]=f[FT_qdecor_n]=f[FT_bigwighmtk_c]=f[FT_bigwighmtk_n]=1;
ftfilter_numerical=f;


indicator2=document.createElement('div');
document.body.appendChild(indicator2);
indicator2.style.position='absolute';
indicator2.style.border='1px dashed #80a6ff';
indicator2.style.zIndex=102;
var t=document.createElement('table');
t.style.backgroundColor='blue';
t.style.opacity=0.16;
t.style.width=t.style.height='100%';
td=t.insertRow(0).insertCell(0);
td.align='center';
td.vAlign='middle';
td.style.color='white';
td.style.fontSize='30px';
indicator2.appendChild(t);
indicator2.veil=t;
var c1=document.createElement('canvas');
c1.width=c1.height=30;
c1.style.position='absolute';
c1.style.left='-30px';
c1.style.opacity=.5;
indicator2.appendChild(c1);
indicator2.leftarrow=c1;
var c2=document.createElement('canvas');
c2.width=c2.height=30;
c2.style.position='absolute';
c2.style.right='-30px';
c2.style.opacity=.5;
indicator2.appendChild(c2);
indicator2.rightarrow=c2;
	{
	var ctx=c1.getContext("2d");
	var lg=ctx.createLinearGradient(0,0,0,c1.height);
	lg.addColorStop(0, "#aaf");
	lg.addColorStop(1, "#003");
	ctx.fillStyle=lg;
	ctx.beginPath();
	var ychi = 7;
	var w=c1.width;
	ctx.moveTo(0,ychi);ctx.lineTo(w/2,ychi);ctx.lineTo(w/2,0);ctx.lineTo(w,w/2);ctx.lineTo(w/2,w);ctx.lineTo(w/2,w-ychi);ctx.lineTo(0,w-ychi);ctx.lineTo(0,w-ychi);ctx.fill();
	ctx = c2.getContext("2d");
	lg = ctx.createLinearGradient(0,0,0,c2.height);
	lg.addColorStop(0, "#aaf");
	lg.addColorStop(1, "#003");
	ctx.fillStyle = lg;
	ctx.moveTo(0,w/2);ctx.lineTo(w/2,0);ctx.lineTo(w/2,ychi);ctx.lineTo(w,ychi);ctx.lineTo(w,w-ychi);ctx.lineTo(w/2,w-ychi);ctx.lineTo(w/2,w);ctx.lineTo(0,w/2);ctx.fill();
	}

indicator=document.createElement('div');
indicator.style.position='absolute';
document.body.appendChild(indicator);
indicator.style.border='1px solid #80A6FF';
indicator.style.zIndex=104;
d=document.createElement('div');
d.style.backgroundColor='blue';
d.style.opacity=0.1;
d.style.width=d.style.height='100%';
indicator.appendChild(d);

invisibleBlanket=document.createElement('div');
document.body.appendChild(invisibleBlanket);
invisibleBlanket.style.position='absolute';
invisibleBlanket.style.zIndex=101;

indicator3=document.createElement('div');
document.body.appendChild(indicator3);
indicator3.style.position='absolute';
indicator3.style.zIndex=102;
d=document.createElement('div');
d.style.position='relative';
indicator3.appendChild(d);
d2=dom_create('div',d);
d2.style.position='absolute';
d2.style.backgroundImage='url('+(gflag.is_cors?gflag.cors_host:'.')+'/images/border-anim-v.gif)';
d2.style.backgroundPosition='0% 0%';
d2.style.backgroundRepeat='no-repeat repeat';
d2=dom_create('div',d);
d2.style.position='absolute';
d2.style.backgroundImage='url('+(gflag.is_cors?gflag.cors_host:'.')+'/images/border-anim-h.gif)';
d2.style.backgroundPosition='0% 0%';
d2.style.backgroundRepeat='repeat no-repeat';
d2=dom_create('div',d);
d2.style.position='absolute';
d2.style.backgroundImage='url('+(gflag.is_cors?gflag.cors_host:'.')+'/images/border-anim-v.gif)';
d2.style.backgroundPosition='100% 0%';
d2.style.backgroundRepeat='no-repeat repeat';
d2=dom_create('div',d);
d2.style.position='absolute';
d2.style.backgroundImage='url('+(gflag.is_cors?gflag.cors_host:'.')+'/images/border-anim-h.gif)';
d2.style.backgroundPosition='0% 100%';
d2.style.backgroundRepeat='repeat no-repeat';

indicator4=dom_create('div');
indicator4.style.position='absolute';
indicator4.style.border='1px solid '+colorCentral.foreground;
indicator4.style.zIndex=102;

indicator6=document.createElement('div');
indicator6.style.position='absolute';
document.body.appendChild(indicator6);
indicator6.style.border='1px solid rgb(255,133,92)';
indicator6.style.zIndex=102;
d=document.createElement('div');
d.style.backgroundColor='#f53d00';
d.style.opacity=0.1;
d.style.width=d.style.height='100%';
indicator6.appendChild(d);

indicator7=document.createElement('div');
document.body.appendChild(indicator7);
indicator7.style.position='absolute';
indicator7.style.borderStyle='solid';
indicator7.style.borderWidth='0px 1px 1px 0px';
indicator7.style.borderColor='#ccc';

pagecloak=document.createElement('div');
document.body.appendChild(pagecloak);
pagecloak.style.position='absolute';
pagecloak.style.left=pagecloak.style.top=0;
pagecloak.style.backgroundColor='rgb(151,154,121)';
pagecloak.style.opacity=0.9;
pagecloak.style.zIndex=99;

waitcloak=dom_create('div');
waitcloak.style.position='absolute';
waitcloak.style.opacity=0.5;
waitcloak.style.zIndex=200;
dom_create('img',waitcloak).src=(gflag.is_cors?gflag.cors_host:'')+'/images/loading.gif';

/* __control__ panels
panels that belong to the page and shared by all browser objs
*/
if(param.cp_oneshot) {
	var d=make_controlpanel(param.cp_oneshot);
	d.__htextdiv.style.fontSize='30px';
	apps.oneshot={main:d};
	var m=dom_create('div',d.__contentdiv,'margin:30px 0px;color:white');
	apps.oneshot.message=m;
	m.className='alertmsg';
	var h=make_headertable(d.__contentdiv);
	apps.oneshot.header=h._h;
	apps.oneshot.belly=h._c;
}
if(param.cp_session) {
	makepanel_session(param.cp_session);
}
if(param.cp_bev) {
	var d=make_controlpanel(param.cp_bev);
	apps.bev={main:d};
}
if(param.cp_svg) {
	var d=make_controlpanel(param.cp_svg);
	apps.svg={main:d};
	var hd=d.__contentdiv;
	hd.style.color=colorCentral.background;
	var p=dom_create('p',hd,'color:inherit;line-height:1.5;');
	apps.svg.showtklabel=dom_addcheckbox(p,'show track name',null);
	var bt=dom_addbutt(hd,'Take screen shot',makesvg_browserpanel_pushbutt,'margin-right:20px;');
	bt.addEventListener('mousedown',makesvg_clear,false);
	apps.svg.submitbutt=bt;
	apps.svg.urlspan=dom_addtext(hd,'');
	dom_create('p',hd,'color:inherit').innerHTML='This generates an SVG file that can be printed to PDF format with your web browser';
}
if(param.cp_gsm) {
	makepanel_gsm(param.cp_gsm);
}
if(param.cp_fileupload) {
	makepanel_fileupload(param.cp_fileupload);
}
if(param.cp_scatter) {
	makepanel_scatter(param.cp_scatter);
}
if(param.cp_hmtk) {
	var d=make_controlpanel(param.cp_hmtk);
	var d2=d.__contentdiv;
	var d3=dom_create('div',d2,'color:white;margin-top:20px;',{t:'If not all custom tracks can be found here, <span class=clb3 onclick=facet2custtklst(event)>show the entire list</span>.'});
	apps.hmtk={
		main:d,
		holder:dom_create('div',d2),
		custtk2lst:d3,
		};
	dom_create('div',d2,'color:white;margin-top:20px;').innerHTML='To get additional tracks, <span class=clb3 onclick=facet2pubs()>load public track hubs</span>.';
}
if(param.cp_publichub) {
	var d=make_controlpanel(param.cp_publichub);
	apps.publichub={main:d};
	var d2=d.__contentdiv;
	apps.publichub.holder=dom_create('div',d2,'margin:25px 0px 20px 0px;width:800px;');
	dom_create('div',d2,'color:white;').innerHTML='After loading a hub, you can find the tracks in <span class=clb3 onclick=pubs2facet()>track table</span>.<br>'+
	'We welcome you to <a href="http://egg.wustl.edu/+" target=_blank>contact us</a> and publish your data as public track hubs.';
}
if(param.cp_custtk) {
	var d=make_controlpanel(param.cp_custtk);
	apps.custtk={main:d};
}
if(param.cp_circlet) {
	var d=make_controlpanel(param.cp_circlet);
	d.style.paddingRight=10;
	apps.circlet={main:d};
	apps.circlet.hash={};
	var d2=d.__hbutt2.parentNode;
	apps.circlet.handleholder=d2;
	stripChild(d2,0);
	d2.style.padding='';
	apps.circlet.holder=dom_create('div',d.__contentdiv);
	gflag.applst.push({name:param.cp_circlet.htext,label:'Chromosomes in a circle',toggle:toggle11});
}
if(param.cp_geneplot) {
	makepanel_geneplot(param.cp_geneplot);
}
if(param.cp_validhub) {
	makepanel_vh(param.cp_validhub);
}
if(param.cp_super) {
	makepanel_super(param.cp_super);
}
if(param.cp_pca) {
	var d=make_controlpanel(param.cp_pca);
	apps.pca={main:d,width:param.cp_pca.width,height:param.cp_pca.height};
	var d2=d.__contentdiv;
	var d3=dom_create('div',d2,'text-align:center;margin-bottom:10px;');
	var c=dom_addcheckbox(d3,'Show sample names',param.cp_pca.showhidename_call);
	c.checked=true;
	apps.pca.showname=c;
	var table=dom_create('table',d2);
	var tr=table.insertRow(0);
	// 1-1
	var td=tr.insertCell(0);
	td.vAlign='middle';
	td.innerHTML='PC2';
	// 1-2
	td=tr.insertCell(-1);
	var c=dom_create('canvas',td);
	c.width=40;
	c.height=param.cp_pca.height;
	apps.pca.pc2scale=c;
	// 1-3
	td=tr.insertCell(-1);
	var d=dom_create('div',td,'position:relative;background-color:white;width:'+param.cp_pca.width+'px;height:'+param.cp_pca.height+'px;');
	apps.pca.dotholder=d;
	// 2-1
	tr=table.insertRow(1);
	td=tr.insertCell(0);
	// 2-2
	td=tr.insertCell(-1);
	// 2-3
	td=tr.insertCell(-1);
	td.align='center';
	c=dom_create('canvas',td,'display:block;');
	c.width=param.cp_pca.width;
	c.height=25;
	apps.pca.pc1scale=c;
	dom_addtext(td,'PC1');
	var d3=dom_create('table',d2,'position:absolute;left:0px;top:0px;background-color:rgba(0,0,0,.1);color:rgba(255,255,255,0.5);font-size:300%;');
	td=d3.insertRow(0).insertCell(0);
	td.align='center';
	td.vAlign='middle';
	td.innerHTML='Running...';
	d3.says=td;
	apps.pca.busy=d3;
}
if(param.cp_navregion) {
	var d=make_controlpanel(param.cp_navregion);
	apps.navregion={main:d};
	d.__contentdiv.style.marginTop=5;
	var d2=dom_create('div',d.__contentdiv,'padding:5px;resize:both;height:50px;width:300px;overflow-y:scroll;');
	apps.navregion.holder=dom_create('div',d2);
	gflag.applst.push({name:param.cp_navregion.htext,label:'Show regions from a list',toggle:toggle30});
}
if(param.cp_findortholog) {
	makepanel_wvfind(param.cp_findortholog);
	gflag.applst.push({name:param.cp_findortholog.htext,label:'Find regions with highly similar sequence from another genome',toggle:toggle31_1});
}


/* end of __control__ panels */


/* makemenu */

menu=dom_create('div',null,'color:#858585;border-style:solid;border-width:2px 1px;border-color:#4D9799 rgba(133,133,133,0.2) #994D96;background-color:white;position:absolute;z-index:103;box-shadow:2px 2px 2px '+colorCentral.foreground_faint_3,{c:'anim_height'});
menu.id='menu';
menu.onmouseover=menu_mover;
menu.onmouseout=menu_mout;

menu.c1=dom_create('div',menu,'color:'+colorCentral.foreground_faint_5+';font-weight:bold;text-align:center;padding:2px');

/* some immediate controls, above Config (which is more controls..)
*/
menu.c45=dom_create('div',menu,'padding:10px;line-height:2;');
var d=dom_create('div',menu.c45);
menu.c45.combine=dom_addcheckbox(d,'Combine two strands',cmtk_combine_change);

var d2=dom_create('div',d,null,{c:'menushadowbox'});
dom_create('div',d2,'font-size:70%;').innerHTML='Strand-specific CG data has been combined.';
var cb=dom_addcheckbox(d2,'Combine CHG',cmtk_combinechg_change);
dom_create('div',d2,'font-size:70%;width:220px;').innerHTML='When combining CHG, CAG/CTG will be combined, but not CCG/CGG. <a href='+FT2noteurl[FT_cm_c]+'#Combining_strands target=_blank>Learn more.</a>.';
menu.c45.combine_chg={div:d2,checkbox:cb};

menu.c45.combine_notshown=dom_create('div',menu.c45,'color:'+colorCentral.foreground_faint_3,{t:'Only one strand available'});

menu.c45.scale=dom_addcheckbox(menu.c45,'Scale bar height by read depth',cmtk_scale_change);
d=dom_create('div',menu.c45);
menu.c45.filter={checkbox:dom_addcheckbox(d,'Filter by read depth',cmtk_filter_change)};
var d2=dom_create('div',d,null,{c:'menushadowbox'});
menu.c45.filter.div=d2;
dom_addtext(d2,'Threshold:&nbsp;&nbsp;');
menu.c45.filter.input=dom_inputnumber(d2,{value:5,width:30,call:cmtk_filter_kd});
dom_addbutt(d2,'Apply',cmtk_filter_change);
menu.c45.table=dom_create('table',menu.c45);
menu.c45.table.cellSpacing=5;

menu.tk2region_showlst=menu_addoption('&#9733;','',menu_showtk2region,menu);
dom_addtext(menu.tk2region_showlst);
// the actual region list holder, right next to menu option
d=dom_create('div',menu);
d.style.padding=8;
d.style.lineHeight=1.8;

// track mode
menu.c22=dom_create('div',menu);
menu.c22.packbutt=dom_addbutt(menu.c22,'SHOW IN PACK MODE');
menu.c22.packbutt.style.margin='5px 10px';
var lst=dom_addrowbutt(menu.c22,[
	{text:'Heatmap',pad:true,call:menuDecorChangemode,attr:{mode:M_trihm}},
	{text:'Arc',pad:true,call:menuDecorChangemode,attr:{mode:M_arc}},
	{text:'Full',pad:true,call:menuDecorChangemode,attr:{mode:M_full}},
	{text:'Thin',pad:true,call:menuDecorChangemode,attr:{mode:M_thin}},
	{text:'Density',pad:true,call:menuDecorChangemode,attr:{mode:M_den}},
	{text:'Barplot',pad:true,call:menuDecorChangemode,attr:{mode:M_bar}},
	],'margin:10px;color:#858585;').firstChild.firstChild.childNodes;
menu.c10=lst[0];
menu.c11=lst[1];
menu.c7=lst[2];
menu.c6=lst[3];
menu.c8=lst[4];
menu.c60=lst[5];

menu.c47=dom_create('div',menu,'padding:10px;line-height:2;');
menu.c47.table=dom_create('table',menu.c47);

/* the Configure */
menu.c5=menu_addoption('&#9881;','Configure',menuConfig,menu);

/* show below config when clicking on mcm */
menu.c64=menu_addoption('&#10004;','Apply matplot',matplot_menucreate,menu);
menu.c65=menu_addoption('&#10005;','Cancel matplot',matplot_menucancel,menu);

menu.c12=menu_addoption('&#9986;','Juxtapose', menuJuxtapose,menu);
menu.c2=menu_addoption(null,'Undo juxtaposition',menuTurnoffJuxtapose,menu);
if(param.cp_circlet)
	menu.c3=menu_addoption('&#10047;','Circlet view',menu_circletview,menu);

if(param.edit_metadata) { // not in use
	menu.c19=menu_addoption('&#9998;','Edit metadata',menuCusttkmdedit,menu);
}
menu.c23=menu_addoption('&#11021;','Flip',menuMcmflip,menu);
menu.c25=menu_addoption('&#10010;','Add metadata terms',menu_mcm_invokemds,menu);


if(param.cp_gsm) { // gene set
	menu.c36=dom_create('div',menu,'margin:12px;width:230px;');
	dom_create('div',menu.c36,null,{c:'header_gr ilcell',t:'&#9998; edit',clc:menu_showgeneset_edit});
}

menu.c54=menu_addoption('&#10005;','Cancel multiple select',menu_multipleselect_cancel,menu);

menu.facetm=dom_create('div',menu);
menu_addoption(null,'Select all',facet_term_selectall,menu.facetm);
menu_addoption(null,'Remove all',facet_term_removeall,menu.facetm);

menu.c13=dom_create('div',menu,'padding:10px;color:#858585;');

menu.font=dom_create('div',menu,'margin:10px;white-space:nowrap;');
var d=dom_create('div',menu.font,'padding-bottom:7px;');
dom_addtext(d,'font family:');
menu.font.family=dom_addselect(d,stc_fontfamily,[
	{text:'sans-serif',value:'sans-serif'},{text:'serif',value:'serif'},
	{text:'times',value:'times'},{text:'arial',value:'arial'},
	{text:'courier',value:'courier'},{text:'monospace',value:'monospace'}]);
menu.font.family.style.margin='0px 10px';
menu.font.bold=dom_addcheckbox(d,'bold',stc_fontbold);
dom_addtext(menu.font,'size: ');
dom_addrowbutt(menu.font,[{text:'+',pad:true,call:stc_fontsize,attr:{increase:1}},{text:'-',pad:true,call:stc_fontsize}],'margin-right:10px;');
menu.font.color=dom_addtext(menu.font,'&nbsp;&nbsp;color&nbsp;&nbsp;','white','coloroval');
menu.font.color.addEventListener('click',stc_textcolor_initiator,false);

// TODO integrate into menu.c50
menu.bed=dom_create('div',menu,'margin:10px;');
menu.bed.color=dom_addtext(menu.bed,'&nbsp;&nbsp;item color&nbsp;&nbsp;','white','coloroval');
menu.bed.color.addEventListener('click',stc_bedcolor_initiator,false);

menu.lr=dom_create('div',menu,'margin:20px 10px 10px 10px;white-space:nowrap;');
var d=dom_create('div',menu.lr,'margin-bottom:20px;');
menu.lr.autoscale=dom_addcheckbox(d,'automatic score threshold',stc_longrange_autoscale);
// positive
var d=dom_create('div',menu.lr);
d.className='titlebox';
var d2=dom_create('div',d,'margin:10px 0px 20px 0px;color:'+colorCentral.foreground_faint_3);
dom_addtext(d2,'0',colorCentral.foreground_faint_5);
menu.lr.pcolor=dom_create('canvas',d2,'margin:0px 5px');
menu.lr.pcolor.width=80;
menu.lr.pcolor.height=15;
menu.lr.pcolor.addEventListener('click',stc_longrange_pcolor_initiator,false);
menu.lr.pcscoresays=dom_addtext(d2);
// color threshold
d3=dom_addtext(d2);
menu.lr.pcscore=dom_inputnumber(d3,{call:stc_longrange_pcolorscore_KU});
dom_addbutt(d3,'set',stc_longrange_pcolorscore);
// filter threshold
var d3=dom_create('div',d2,'margin-top:5px;');
dom_addtext(d3,'filter threshold ','#858585');
menu.lr.pfscore=dom_inputnumber(d3,{call:stc_longrange_pfilterscore_KU});
dom_addbutt(d3,'set',stc_longrange_pfilterscore);
dom_create('div',d,'background-color:white;').innerHTML='Positive score';
// negative
d=dom_create('div',menu.lr);
d.className='titlebox';
d2=dom_create('div',d,'margin:10px 0px 20px 0px;color:'+colorCentral.foreground_faint_3);
dom_addtext(d2,'0',colorCentral.foreground_faint_5);
menu.lr.ncolor=dom_create('canvas',d2,'margin:0px 5px;');
menu.lr.ncolor.width=80;
menu.lr.ncolor.height=15;
menu.lr.ncolor.addEventListener('click',stc_longrange_ncolor_initiator,false);
menu.lr.ncscoresays=dom_addtext(d2);
// color threshold
d3=dom_addtext(d2);
menu.lr.ncscore=dom_inputnumber(d3,{call:stc_longrange_ncolorscore_KU});
dom_addbutt(d3,'set',stc_longrange_ncolorscore);
// filter threshold
d3=dom_create('div',d2,'margin-top:5px;');
dom_addtext(d3,'filter threshold ','#858585');
menu.lr.nfscore=dom_inputnumber(d3,{call:stc_longrange_nfilterscore_KU});
dom_addbutt(d3,'set',stc_longrange_nfilterscore);
dom_create('div',d,'background-color:white;').innerHTML='Negative score';

menu.bam=dom_create('div',menu,'margin:10px;');
menu.bam.f=dom_addtext(menu.bam,'&nbsp;forward&nbsp;','white','coloroval');
menu.bam.f.addEventListener('click',stc_forwardcolor_initiator,false);
dom_addtext(menu.bam,'&nbsp;');
menu.bam.r=dom_addtext(menu.bam,'&nbsp;reverse&nbsp;','white','coloroval');
menu.bam.r.addEventListener('click',stc_reversecolor_initiator,false);
dom_addtext(menu.bam,'&nbsp;');
menu.bam.m=dom_addtext(menu.bam,'&nbsp;mismatch&nbsp;','black','coloroval');
menu.bam.m.addEventListener('click',stc_mismatchcolor_initiator,false);

menu.c48=dom_create('div',menu,'padding:15px;border-top:solid 1px '+colorCentral.foreground_faint_1);
menu.c49=dom_create('div',menu,'padding:10px;border-top:solid 1px '+colorCentral.foreground_faint_1);
menu.c49.color=dom_create('span',menu.c49,'display:block;margin:10px 20px;padding:3px 20px;');
menu.c49.color.className='coloroval';
menu.c49.color.innerHTML='track color';
menu.c49.color.addEventListener('click',ldtk_color_initiator,false);
var tt=dom_create('table',menu.c49);
tt.cellSpacing=5;
var tr=tt.insertRow(0);
tr.insertCell(0).innerHTML='tick size';
var td=tr.insertCell(1);
dom_addbutt(td,'&nbsp;+&nbsp;',ldtk_ticksize).change=1;
dom_addbutt(td,'&nbsp;-&nbsp;',ldtk_ticksize).change=-1;
tr=tt.insertRow(1);
tr.insertCell(0).innerHTML='link line height';
var td=tr.insertCell(1);
dom_addbutt(td,'&nbsp;+&nbsp;',ldtk_topheight).change=10;
dom_addbutt(td,'&nbsp;-&nbsp;',ldtk_topheight).change=-10;


menu.c50=dom_create('div',menu);
var d=dom_create('div',menu.c50,'margin:15px;white-space:nowrap;');
var s=dom_addtext(d,'',null,'coloroval');
menu.c50.color1=s;
s.addEventListener('click',qtc_color1_initiator,false);
s.style.padding='2px 10px';
s.style.marginRight=20;
s=dom_addtext(d,'',null,'coloroval');
menu.c50.color1_1=s;
s.style.padding='2px 10px';
s.addEventListener('click',qtc_color1_1_initiator,false);
menu.c50.row2=dom_create('div',menu.c50,'margin:15px;white-space:nowrap;padding-top:10px;border-top:dashed 2px '+colorCentral.foreground_faint_2);
s=dom_addtext(menu.c50.row2,'',null,'coloroval');
menu.c50.color2=s;
s.style.padding='2px 10px';
s.addEventListener('click',qtc_color2_initiator,false);
s.style.marginRight=20;
s=dom_addtext(menu.c50.row2,'',null,'coloroval');
menu.c50.color2_1=s;
s.style.padding='2px 10px';
s.addEventListener('click',qtc_color2_1_initiator,false);
// feel free to add more color cells

menu.c51=dom_create('div',menu,'white-space:nowrap;padding:10px;border-top:solid 1px '+colorCentral.foreground_faint_1);
menu.c51.sharescale=dom_create('div',menu.c51,'margin:5px 5px 15px 5px;padding:5px;background-color:rgba(255,204,51,.5);font-size:70%;text-align:center;',{t:'This track shares Y scale with other tracks.'});
dom_addtext(menu.c51,'Y-axis scale&nbsp;');
menu.c51.select=dom_addselect(menu.c51,toggle26,[
	{text:'Automatic',value:scale_auto,selected:true},
	{text:'Fixed',value:scale_fix},
	{text:'Percentile',value:scale_percentile}
]);
// fixd scale
var d=dom_create('div',menu.c51,'display:none;',{c:'menushadowbox'});
menu.c51.fix=d;
dom_addtext(d,'min:&nbsp;');
d.min=dom_inputnumber(d,{width:50,value:0,call:qtc_setfixscale_ku});
dom_addtext(d,'&nbsp;&nbsp;max:&nbsp;');
d.max=dom_inputnumber(d,{width:50,value:10,call:qtc_setfixscale_ku});
dom_addbutt(d,'apply',qtc_setfixscale);
// percentile threshold
var d=dom_create('div',menu.c51,'display:none;',{c:'menushadowbox'});
menu.c51.percentile=d;
d.says=dom_addtext(d,'');
dom_addrowbutt(d,[
	{text:'&#10010;',pad:true,call:qtc_percentile,attr:{change:5}},
	{text:'&#9473;',pad:true,call:qtc_percentile,attr:{change:-5}},
	{text:'+',pad:true,call:qtc_percentile,attr:{change:1}},
	{text:'-',pad:true,call:qtc_percentile,attr:{change:-1}},
	],'margin-left:10px;');

menu.c59=dom_create('div',menu,'padding:10px;border-top:solid 1px '+colorCentral.foreground_faint_1);
dom_addtext(menu.c59,'Summary method&nbsp;');
menu.c59.select=dom_addselect(menu.c59,menu_qtksummary_select,
	[{value:summeth_mean,text:'Average'},
	{value:summeth_max,text:'Max'},
	{value:summeth_min,text:'Min'},
	{value:summeth_sum,text:'Total'} ]);
menu.c59.select.style.marginRight=15;
dom_addtext(menu.c59,'<a href=https://plus.google.com/117328025606874451908/posts/5Y7j6fB3Td3 target=_blank>&nbsp;?&nbsp;</a>');

menu.c52=dom_create('div',menu,'padding:10px;border-top:solid 1px '+colorCentral.foreground_faint_1);
dom_addtext(menu.c52,'Logarithm&nbsp;');
menu.c52.select=dom_addselect(menu.c52,menu_log_select,
	[{value:log_no,text:'No'},
	{value:log_2,text:'log2'},
	{value:log_e,text:'ln'},
	{value:log_10,text:'log10'} ]);

menu.c14=dom_create('div',menu,'padding:10px;white-space:nowrap;border-top:solid 1px '+colorCentral.foreground_faint_1);
dom_addtext(menu.c14,'Height&nbsp;&nbsp;');
var t=dom_addrowbutt(menu.c14,[
	{text:'&#10010;',pad:true,call:menu_tkh_change,attr:{changetype:1,amount:5}},
	{text:'&#9473;',pad:true,call:menu_tkh_change,attr:{changetype:1,amount:-5}},
	{text:'+',pad:true,call:menu_tkh_change,attr:{changetype:1,amount:1}},
	{text:'-',pad:true,call:menu_tkh_change,attr:{changetype:1,amount:-1}},
	{text:'Unify',call:menu_tkh_change,attr:{changetype:2}},]);
menu.c14.unify=t.firstChild.firstChild.childNodes[4];
menu.c14.unify.style.backgroundColor=colorCentral.magenta7;
menu.c14.unify.style.color='white';

menu.c46=dom_create('div',menu,'padding:10px;border-top:solid 1px '+colorCentral.foreground_faint_1);
menu.c46.checkbox=dom_addcheckbox(menu.c46,'Smooth window&nbsp;&nbsp;&nbsp;',menu_smoothwindow_checkbox);
dom_addtext(menu.c46,'<a href=http://washugb.blogspot.com/2013/10/v26-3-of-3-smoothing-curves.html target=_blank>&nbsp;?&nbsp;</a>');
var d=dom_create('div',menu.c46,'display:none;',{c:'menushadowbox'});
menu.c46.div=d;
menu.c46.says=dom_addtext(d);
dom_addrowbutt(d,[{text:'&#10010;',pad:true,call:menu_smoothwindow_change,attr:{change:2}},
	{text:'&#9473;',pad:true,call:menu_smoothwindow_change,attr:{change:-2}}],
	'margin-left:10px;');

menu.c29=dom_create('div',menu,'padding:10px;border-top:solid 1px '+colorCentral.foreground_faint_1);
menu.c29.checkbox=dom_addcheckbox(menu.c29,'Bar chart background&nbsp;&nbsp;&nbsp;',menu_barplotbg_change);
dom_addtext(menu.c29,'<a href=http://wiki.wubrowse.org/Datahub#barplot_bg target=_blank>&nbsp;?&nbsp;</a>');
menu.c29.color=dom_create('div',menu.c29,'display:none;cursor:default;',{c:'menushadowbox',clc:tk_barplotbg_initiator,t:'choose color'});

menu.c44=dom_create('div',menu,'padding:10px;border-top:solid 1px '+colorCentral.foreground_faint_1);
menu.c44.checkbox=dom_addcheckbox(menu.c44,'Track background',menu_tkbg_change);
menu.c44.color=dom_create('div',menu.c44,'display:none;cursor:default;background-color:#e0e0e0;',{c:'menushadowbox',clc:tk_bgcolor_initiator,t:'choose color'});

if(param.menu_curvenoarea) {
	menu.c66=dom_create('div',menu,'padding:10px;border-top:solid 1px '+colorCentral.foreground_faint_1);
	menu.c66.checkbox=dom_addcheckbox(menu.c66,'Curve only',menu_tkcurveonly_change);
}



menu.c53=dom_create('div',menu,'padding:10px;border-top:solid 1px '+colorCentral.foreground_faint_1);
menu.c53.checkbox=dom_addcheckbox(menu.c53,'Apply to all tracks',toggle15);

menu.c16=menu_addoption('&#8505;','Information',menuGetonetrackdetails,menu);

/* menu - select tk to add, small panel in menu */
var d=dom_create('div',menu);
menu.facettklstdiv=d;
var d2=dom_create('div',d,'margin:10px');
var d3=dom_create('div',d2,'overflow-y:scroll;resize:vertical;');
var table=dom_create('table',d3);
menu.facettklsttable=table;
d2=dom_create('div',d,'margin:10px');
menu.facettklstdiv.buttholder=d2;
var d3=dom_create('div',d2,'display:inline-block;width:150px');
var d4=dom_create('div',d3);
d4.className='bigsubmit';
d.submit=d4;
d4.count=0;
d4.addEventListener('click',facet_tklst_addSelected,false);
d4.style.width=120;
dom_addbutt(d2,'Select all',facet_tklst_toggleall).tofill=true;
dom_addbutt(d2,'Deselect all',facet_tklst_toggleall).tofill=false;
menu.facetremovebutt=dom_addbutt(d2,'remove all',facet_tklst_removeall);

menu.c18=dom_create('div',menu);
menu.c18.style.padding=8;
var c=dom_create('canvas',menu.c18);
c.width=400;
c.height=40;
menu.c18_canvas=c;
c.onmousedown=c18_md;
c.onmousemove=c18_m_pica;
c.onmouseout=pica_hide;

menu.relocate=dom_create('div',menu);
// div1
menu.relocate.div1=dom_create('div',menu.relocate);
var tt=dom_create('table',menu.relocate.div1);
tt.cellSpacing=10;
var tr=tt.insertRow(0);
menu.relocate.coord=dom_inputtext(tr.insertCell(0),{ph:'coordinate',size:16,call:menuJump_keyup});
menu.relocate.gene=dom_inputtext(tr.insertCell(-1),{ph:'gene name',size:12,call:jumpgene_keyup});
dom_addbutt(tr.insertCell(-1),'&nbsp;Go&nbsp;',menuJump);
dom_addbutt(tr.insertCell(-1),'Clear',jump_clearinput);
tr=tt.insertRow(1);
menu.relocate.snptr=tr;
tr.insertCell(0);
menu.relocate.snp=dom_inputtext(tr.insertCell(-1),{ph:'rs75669958',size:12,call:jumpsnp_keyup});
var td=tr.insertCell(-1);
td.colSpan=2;
dom_addbutt(td,'&nbsp;Find SNP&nbsp;',menuJumpsnp);

tt=dom_create('table',menu.relocate.div1);
menu.relocate.jumplstholder=tt;
tt.cellSpacing=0; tt.cellPadding=2;
tt.style.fontSize='12px';
tt.style.color='#545454';
menu.c24=menu_addoption(null,'Zoom into a chromosome',toggle6,menu.relocate.div1);
menu.c43=menu_addoption(null,'Show linkage group',toggle25,menu.relocate.div1);
// div2, list of chromosomes
menu.relocate.div2=dom_create('div',menu.relocate);
d=dom_create('div',menu.relocate.div2);
d.style.backgroundColor='#ededed';
var d2=dom_create('div',d);
d2.style.color='#006699';
d2.style.textAlign='center';
menu.relocate.scfd_foo=d2;
//dom_addtext(d2,'go back','black','header_gr').addEventListener('click',toggle6,false);
dom_addtext(d2,'Select a location from one of the chromosomes').style.margin='0px 20px';
dom_addbutt(d2,'Customize',scfd_invokeconfigure);
d2=dom_create('div',menu.relocate.div2);
menu.relocate.scfd_bar=d2;
d2.style.color='#858585';
d2.style.textAlign='center';
dom_addtext(d2,'drag ');
dom_addtext(d2,'chr',null,'header_b');
dom_addtext(d2,' to rearrange &nbsp;&nbsp;');
dom_addbutt(d2,'Update',scfd_updateconfigure);
dom_addbutt(d2,'Cancel',scfd_cancelconfigure);
// div3, linkage group
menu.relocate.div3=dom_create('div',menu.relocate,'display:none;padding:10px 20px');

menu.scfd_holder=dom_create('div',menu.relocate.div2);
menu.scfd_holder.style.margin=10;

menu.decorcatalog=dom_create('div',menu,'color:inherit');

menu.grandadd=dom_create('div',menu);
d2=dom_create('div',menu.grandadd);
var d3=dom_create('div',d2,'padding:10px 18px;cursor:default;background-color:rgba(77,151,153,.2);color:'+colorCentral.foreground);
menu.grandadd.says=d3;
d3.className='opaque7';
d3.addEventListener('click',toggle1_1,false);
var d3=dom_create('div',d2,'padding:20px;');
menu.grandadd.kwinput=dom_inputtext(d3,{size:13,call:tkkwsearch_ku,ph:'track name'});
dom_addbutt(d3,'Find',tkkwsearch);
var s=dom_addtext(d3,'&nbsp;?&nbsp;');
s.addEventListener('mouseover',kwsearch_tipover,false);
s.addEventListener('mouseout',pica_hide,false);
menu.grandadd.pubh=menu_addoption(null,'<span style="font-size:140%">P</span>UBLIC track hubs',toggle8_1,d2);
menu_addoption(null,'<span style="font-size:140%">A</span>NNOTATION tracks',toggle13,d2);
var d4=menu_addoption(null,'<span style="font-size:140%">C</span>USTOM tracks ',toggle28,d2);
menu.grandadd.custtkcount=dom_addtext(d4.firstChild,'');
menu.grandadd.cust=d4;

menu.c35=dom_create('div',menu);
d2=dom_create('div',menu.c35,'border:solid 1px '+colorCentral.foreground_faint_1+';margin:15px;');
var d3=dom_create('div',d2,'padding:10px 18px;cursor:default;background-color:'+colorCentral.foreground_faint_1+';color:'+colorCentral.foreground);
menu.c35.says=d3;
d3.className='opaque5';
d3.addEventListener('click',toggle1_1,false);
var d4=dom_create('div',d2);
menu.c35.opt=d4;
menu_addoption(null,'List of all',menu_custtk_showall,d4);
var d4=menu_addoption('&#10010;','Add new tracks',toggle7_1,d2);

/* FIXME circlet plot will hold multiple lr track
each track will have its own color set
need to specify which track is being configured
*/
menu.c26=dom_create('div',menu);
menu.c26.style.padding=8;
menu.c26.innerHTML='Graph size <button type=button change=15 onclick=hengeview_changeradius(event)>&#10010;</button> \
<button type=button change=-15 onclick=hengeview_changeradius(event)>&#9473;</button>\
<div style="height:7px;"></div>\
<label for=hengeview_z_1>Show scale?</label> <input id=hengeview_z_1 type=checkbox onchange=hengeview_showhidescale(event)>';

menu.c28=dom_create('div',menu);
menu.c28.style.padding=8;
menu.c28.innerHTML='<button type=button turnon=1 onclick=hengeview_regiontoggleall(event)>show all</button>\
<button type=button turnon=0 onclick=hengeview_regiontoggleall(event)>hide all</button>\
<table class=container id=hengeview_chrholder style="margin:5px;"><tbody></tbody></table>';

menu.c27=dom_create('div',menu);
menu.c27.style.padding=8;
menu.c27.style.borderTop='solid 1px #ededed';
menu.c27.innerHTML='<label for=hengeview_z_2>Show cytoband?</label> <input id=hengeview_z_2 type=checkbox onchange=hengeview_togglecytoband(event)>\
<div style="height:7px;"></div>\
Chromosome bar size <button type=button change=1 onclick=hengeview_changechrbarsize(event)>&#10010;</button> \
<button type=button change=-1 onclick=hengeview_changechrbarsize(event)>&#9473;</button>';


menu.apppanel=dom_create('div',menu);
var d=dom_create('div',menu.apppanel,'padding:18px;');
menu.apppanel.kwinput=dom_inputtext(d,{size:13,ph:'app name',call:findApp});
dom_addbutt(d,'Find',findApp_butt).style.marginRight=10;
dom_addtext(d,'All apps','gray','clb').onclick=showallapp;
var d2=dom_create('div',menu.apppanel,'width:250px;padding:0px 0px 10px 10px;');
menu.apppanel.sc_holder=d2;

if(param.cp_custtk) {
	apps.custtk.shortcut=[];
	var fn=function(){custtk_shortcut(FT_bedgraph_c);};
	apps.custtk.shortcut[FT_bedgraph_c]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'bedGraph',clc:fn});
	gflag.applst.push({name:'BedGraph track',toggle:fn});
	fn=function(){custtk_shortcut(FT_bigwighmtk_c);};
	apps.custtk.shortcut[FT_bigwighmtk_c]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'bigWig',clc:fn});
	gflag.applst.push({name:'BigWig track',toggle:fn});
	fn=function(){custtk_shortcut(FT_cat_c);};
	apps.custtk.shortcut[FT_cat_c]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'categorical',clc:fn});
	gflag.applst.push({name:'Categorical track',toggle:fn});
	fn=function(){custtk_shortcut(FT_anno_c);};
	apps.custtk.shortcut[FT_anno_c]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'hammock',clc:fn});
	gflag.applst.push({name:'Hammock track',toggle:fn});
	fn=function(){custtk_shortcut(FT_weaver_c);};
	apps.custtk.shortcut[FT_weaver_c]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'genomealign',clc:fn});
	gflag.applst.push({name:'Genomealign track',toggle:fn});
	fn=function(){custtk_shortcut(FT_lr_c);};
	apps.custtk.shortcut[FT_lr_c]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'interaction',clc:fn});
	gflag.applst.push({name:'Long-range interaction',toggle:fn});
	fn=function(){custtk_shortcut(FT_bed_c);};
	apps.custtk.shortcut[FT_bed_c]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'bed',clc:fn});
	gflag.applst.push({name:'Bed track',toggle:fn});
	fn=function(){custtk_shortcut(FT_bam_c);};
	apps.custtk.shortcut[FT_bam_c]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'BAM',clc:fn});
	gflag.applst.push({name:'BAM track',toggle:fn});
	fn=function(){custtk_shortcut(FT_huburl);};
	apps.custtk.shortcut[FT_huburl]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'datahub',clc:fn});
	gflag.applst.push({name:'Datahub',toggle:fn});
	/*
	fn=function(){custtk_shortcut(FT_catmat);};
	apps.custtk.shortcut[FT_]=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'',clc:fn});
	gflag.applst.push({name:'custom track: ',toggle:fn});
	*/
}

d=dom_create('div',menu.apppanel);
if(param.cp_fileupload) {
	apps.fud.shortcut=menu_appoption(d,'&#11014;','File upload','Upload data from text files',toggle27);
	gflag.applst.push({name:'File upload',label:'Upload data from text files',toggle:toggle27});
}
if(param.cp_gsm) {
	apps.gsm.shortcut=menu_appoption(d,'&#10034;','Gene & region set','Create and manage sets of genes/regions',toggle10);
	gflag.applst.push({name:'Gene set',label:'Create and manage sets of genes/regions',toggle:toggle10});
}
if(param.cp_bev) {
	apps.bev.shortcut=menu_appoption(d,'&#10038;','Genome snapshot','View track at whole-genome scale',toggle18);
	gflag.applst.push({name:'Genome snapshot',label:'View track at whole-genome scale',toggle:toggle18});
}
if(param.cp_scatter) {
	apps.scp.shortcut=menu_appoption(d,'&#8759;','Scatter plot','Compare two tracks over a gene set',toggle19);
	gflag.applst.push({name:'Scatter plot',label:'Compare two numerical tracks over a gene set',toggle:toggle19});
}
if(param.app_splinter) {
	menu_appoption(d,'&#9707;','Split panel','Create a secondary browser panel',function(){gflag.menu.bbj.splinter_issuetrigger('nocoord_fromapp');menu_hide();});
	gflag.applst.push({name:'Split panel',label:'Create a secondary browser panel',toggle:function(){gflag.menu.bbj.splinter_issuetrigger('nocoord_fromapp');menu_hide();}});
}
if(param.cp_session) {
	apps.session.shortcut=menu_appoption(d,'&#10084;','Session','Save and share contents',toggle12);
	gflag.applst.push({name:'Session',label:'Save and share contents',toggle:toggle12});
}
if(param.cp_svg) {
	apps.svg.shortcut=menu_appoption(d,'&#9113;','Screenshot','Make publication-quality image',svgpanelshow);
	gflag.applst.push({name:'Screen shot',label:'Make publication-quality image',toggle:svgpanelshow});
}
if(param.cp_geneplot) {
	apps.gplot.shortcut=dom_create('div',d2,'display:none;',{c:'header_b ilcell',t:'gene plot',clc:toggle4});
	gflag.applst.push({name:'Gene plot',label:'Data distribution within a gene set',toggle:toggle4});
}

var d=dom_create('div',menu,'margin:15px;');
menu.apppanel.getseq={main:d};
dom_addtext(d,'Paste coordinates here<br><span style="font-size:70%;opacity:.6;">One coordinate per line</span><br>');
var ip=dom_create('textarea',d);
ip.cols=30;
menu.apppanel.getseq.input=ip;
var d2=dom_create('div',d,'margin-top:10px;');
menu.apppanel.getseq.butt=dom_addbutt(d2,'Submit',app_get_sequence);
dom_addbutt(d2,'Clear',function(){menu.apppanel.getseq.input.value='';});
menu.apppanel.getseq.shortcut=dom_create('div',menu.apppanel.sc_holder,'display:none;',{c:'header_b ilcell',t:'get sequence',clc:toggle33});
gflag.applst.push({name:'Get sequence',toggle:toggle33});

if(param.app_bbjconfig) {
	var d=dom_create('div',menu);
	menu.bbjconfig=d;
	var d2=dom_create('div',d,'margin:20px;white-space:nowrap;');

	var table=dom_create('table',d2,'color:#858585;');
	var tr=table.insertRow(0);
	var td=tr.insertCell(0);
	td.style.paddingRight=10;
	dom_create('div',td,'font-size:90%;color:inherit;').innerHTML='Browser panel width';
	var d3=dom_addrowbutt(td,[
		{text:'&#10010;',pad:true,call:menu_changehmspan,attr:{which:1}},
		{text:'&#9473;',pad:true,call:menu_changehmspan,attr:{which:2}},
		{text:'+',pad:true,call:menu_changehmspan,attr:{which:3}},
		{text:'-',pad:true,call:menu_changehmspan,attr:{which:4}},
		{text:'Set',call:menu_hmspan_set},
		],'color:inherit;');
	d.setbutt=d3.firstChild.firstChild.childNodes[4];
	d.setbutt.style.backgroundColor=colorCentral.magenta7;
	d.setbutt.style.color='white';

	var nwcall=null; // callback to for change name width
	if(param.app_bbjconfig.changetknw) {
		nwcall=param.app_bbjconfig.changetknw.call;
		if(!nwcall) {
			print2console('No callback provided for app_bbjconfig.changetknw',2);
		}
	}
	if(nwcall) {
		td=tr.insertCell(1);
		d.leftwidthdiv=td;
		dom_create('div',td,'font-size:90%;').innerHTML='Track name width';
		dom_addrowbutt(td,[
			{text:'&#10010;',pad:true,call:nwcall,attr:{which:1}},
			{text:'&#9473;',pad:true,call:nwcall,attr:{which:2}},
			{text:'+',pad:true,call:nwcall,attr:{which:3}},
			{text:'-',pad:true,call:nwcall,attr:{which:4}},
			]);
	}

	d2=dom_create('div',d,'margin:20px;');
	d.allow_packhide_tkdata=dom_addcheckbox(d2,'Allow "pack and hide" for track items',toggle14);
	dom_create('div',d2,'display:none;margin:10px;').innerHTML='Please use with caution! <a href=http://washugb.blogspot.com/2014/03/v33-2-of-2-hide-undesirable-items-from.html target=_blank>Learn more.</a>';
}

var d=dom_create('div',menu,'margin:10px;width:220px;color:#858585;');
menu.zoomoutalert=d;
d.count=dom_addtext(d);
dom_addtext(d,' items have been loaded.');
var d2=dom_create('div',d,null,{c:'button_warning',clc:risky_zoomout});
dom_addtext(d2,'Zoom out ');
d.fold=dom_addtext(d2);
d.fold.style.fontSize='200%';
dom_addtext(d2,' fold');
dom_addtext(d,'Zoom out to such scale might take long time to load new items and might even halt your web browser.');
dom_create('div',d,'margin:10px;',{c:'header_gr',t:'Cancel',clc:menu_hide});

var d=dom_create('div',menu,'margin:10px;width:220px;color:#858585;');
menu.changemodealert=d;
dom_addtext(d,'By changing mode, ');
d.count=dom_addtext(d);
dom_addtext(d,' items will be loaded and rendered, which could slow down your system.');
var d2=dom_create('div',d,null,{c:'button_warning',clc:risky_changemode});
dom_addtext(d2,'Change mode to ');
d.mode=dom_addtext(d2);
dom_create('div',d,'margin:10px;',{c:'header_gr',t:'Cancel',clc:menu_hide});



if(param.stickynote) {
	menu.stickynote=dom_create('div',menu);
	// c1
	menu_addoption('&#10010;','New note',coordnote_showinputpanel,menu.stickynote).doedit=false;
	// c2
	var x=dom_create('div',menu.stickynote);
	x.style.margin=10;
	dom_addtext(x,'At ');
	menu.stickynote.says=dom_addtext(x);
	dom_addtext(x,':');
	var t=dom_create('textarea',x);
	t.style.display='block';
	t.rows=5;
	t.cols=20;
	menu.stickynote.textarea=t;
	dom_addbutt(x,'Submit',coordnote_submit);
	// c3
	x=dom_create('div',menu.stickynote);
	menu_addoption('&#9998;','Edit',coordnote_showinputpanel,x).doedit=true;
	menu_addoption('&#10005;','Delete',coordnote_delete,x);
}

var t=dom_create('table',menu,'margin:8px;color:'+colorCentral.foreground_faint_7+';white-space:nowrap;');
menu.genemodellstholder=t;
t.style.cellSpacing=0;
t.style.cellPadding=2;

/*
menu.c9=menu_addoption('&#10140;','Change color',show_mcmColorConfig,menu);
var d=dom_create('table',menu); // next sibling of c9
d.style.margin=10;
d.cellSpacing=10;
*/

if(param.cp_circlet) {
	menu.c15=menu_addoption(null,'Graph',menu_hengeview_configrender,menu);
	menu.c17=menu_addoption(null,'Chromosomes & regions',menu_hengeview_configregions,menu);
	menu.c21=menu_addoption(null,'Zoom out 1 fold',menu_hengeview_zoomout,menu);
	apps.circlet.shortcut=dom_create('div',menu.apppanel.sc_holder,'display:none;',{t:'circlet view',c:'header_b ilcell',clc:toggle11});
}

// TODO
//menu.c30=menu_addoption('&#8767;','View as line plot',menu_2matplot,menu);

var d=dom_create('div',menu,'padding:10px;cursor:default;white-space:nowrap;opacity:.5;'+
'background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2r9//38gYGAEESAAEGAAasgJOgzOKCoAAAAASUVORK5CYII=)');
menu.c55=d;
d.setAttribute('holderid','menu');
d.addEventListener('mousedown',cpmoveMD,false);
d.says=dom_addtext(d,null);

menu.c31=dom_create('div',menu);

menu.c57=menu_addoption(null,'Search for terms',toggle34,menu);
gflag.applst.push({name:'Metadata term finder',label:'Search for metadata terms by keyword',toggle:toggle34});
menu.c57.shortcut=dom_create('div',menu.apppanel.sc_holder,'display:none;',{c:'header_b ilcell',t:'find metadata terms',clc:toggle34});

if(param.cp_navregion) {
	apps.navregion.shortcut=dom_create('div',menu.apppanel.sc_holder,'display:none;',{c:'header_b ilcell',t:'navigate regions',clc:toggle30});
}
if(param.cp_findortholog) {
	apps.wvfind.shortcut=dom_create('div',menu.apppanel.sc_holder,'display:none;',{c:'header_b ilcell',t:'find ortholog',clc:toggle31_1});
}
if(param.cp_validhub) {
	// the last shortcut
	apps.vh.shortcut=dom_create('div',menu.apppanel.sc_holder,'display:none;',{c:'header_b ilcell',t:'validate hub & refresh cache',clc:toggle29});
	gflag.applst.push({name:'Validate datahub',label:'Validate datahub and refresh cache',toggle:toggle29});
}

menu.c32=dom_create('div',menu);
menu.c33=menu_addoption(null,' ',get_genome_info,menu);
if(param.addnewgenome) {
	menu.c34=menu_addoption(null,'Add new genome <span style="font-size:60%">EXPERIMENTAL</span>',add_new_genome,menu);
}

var d=dom_create('div',menu,'margin:10px;');
menu.c56=d;
d.input=dom_inputtext(d,{size:12,call:mdtermsearch_ku,ph:'enter keyword'});
dom_addbutt(d,'Search',mdtermsearch);
var d2=dom_create('div',d,'max-height:'+(parseInt(maxHeight_menu)-100)+'px;overflow-y:scroll;');
d.table=dom_create('table',d2,'margin-top:10px;');

if(param.cp_gsm) {
	// send gene set to ...
	dom_create('div',menu.c36,null,{t:'gene set view',c:'header_b ilcell',clc:menu_gs2gsv});
	if(param.cp_navregion) {
		dom_create('div',menu.c36,null,{c:'header_b ilcell',t:'navigate',clc:menu_gs2navregion});
	}
	if(param.cp_scatter) {
		dom_create('div',menu.c36,null,{c:'header_b ilcell',t:'scatter plot',clc:menu_gs2scp});
	}
	if(param.cp_geneplot) {
		dom_create('div',menu.c36,null,{c:'header_b ilcell',t:'gene plot',clc:menu_gs2gplot});
	}
	menu.c36a=dom_create('div',menu.c36,null,{c:'header_b ilcell',t:'find orthologs',clc:menu_gs2wvfind});
	if(param.cp_super) {
		dom_create('div',menu.c36,null,{c:'header_b ilcell',t:'call super enhancer',clc:menu_gs2super});
	}
	if(param.cp_proteinview) {
		dom_create('div',menu.c36,null,{c:'header_b ilcell',t:'protein view',clc:menu_gs2protein});
	}
}


// this should be at the bottom of the menu
menu.c4=menu_addoption('&#10005;','Remove',menuRemove,menu);
menu.c4.firstChild.style.color='red';

menu.c58=menu_addoption('&#8634;','Refresh cache',menu_refreshcache,menu);

if(param.cp_bev) {
	// bev panel config
	d=dom_create('div',menu,'padding:10px');
	menu.c40=d;
	dom_addtext(d,'panel width: ');
	menu.c40.says=dom_addtext(d,'');
	dom_addtext(d,'&nbsp;pixels&nbsp;&nbsp;');
	var s=dom_addselect(d,bev_setchrmaxwidth,[
		{text:'change',value:-1,selected:true},
		{text:'600 px',value:600}, {text:'800 px',value:800}, {text:'1000 px',value:1000}, {text:'1200 px',value:1200}, {text:'1400 px',value:1400}, {text:'1600 px',value:1600}, {text:'1800 px',value:1800}, {text:'2000 px',value:2000},
	]);
	dom_create('br',d);
	dom_addtext(d,'Set plot width of longest chromosome to selected value.<br>Width of other chromosomes will scale accordingly.<br>This determines track data resolution.','#858585');
	dom_create('br',d); dom_create('br',d);
	dom_addtext(d,'panel height ');
	dom_addbutt(d,'&#10010;',bev_changepanelheight).increase=true;
	dom_addbutt(d,'&#9473;',bev_changepanelheight).increase=false;
	dom_create('br',d); dom_create('br',d);
	dom_addtext(d, 'chromosome bar height ');
	dom_addbutt(d,' + ',bev_changechrheight).increase=true;
	dom_addbutt(d,' - ',bev_changechrheight).increase=false;
}

menu.c62=menu_addoption('&#8645','&nbsp;',weaver_flip,menu);
//menu.c63=menu_addoption('?','&nbsp;',weaver_queryjumpui,menu);
menu.c61=dom_create('div',menu,'border-top:1px solid '+colorCentral.foreground_faint_1);
dom_create('div',menu.c61,'display:inline-block;margin:10px 15px;padding:3px 5px;border:1px solid #858585;border-radius:5px;',{c:'opaque5'});

/* makemenu ends */


bubble=dom_create('table',null,'position:absolute;z-index:103;');
bubble.cellSpacing=bubble.cellPadding=0;
bubble.onmouseover=bubbleMover;
bubble.onmouseout=bubbleMout;
var tr=bubble.insertRow(0);
var td=tr.insertCell(0);
var c=dom_create('canvas',td);
c.width=c.height=15;
c.style.marginLeft=4;
	{
	var ctx=c.getContext("2d");
	ctx.fillStyle="#850063";
	ctx.beginPath();
	ctx.moveTo(0, 15);
	ctx.lineTo(8,0);
	ctx.lineTo(15,15);
	ctx.fill();
	}
tr=bubble.insertRow(-1);
td=tr.insertCell(0);
td.className='bubbleCls';
bubble.says=dom_create('div',td,'color:white;font-size:12px;',{c:'anim_height'});
bubble.sayajax=dom_create('div',td,'color:white;margin:10px;font-size:12px;',{c:'anim_height'});


// pica is on top of menu
pica=dom_create('div',document.body,'position:fixed;border:1px solid white;z-index:103;');
var d=dom_create('div',pica,'position:relative;');
dom_create('div',d,'position:absolute;left:0px;top:0px;background-color:rgba(0,53,82,.8);width:100%;height:100%;');
picasays=dom_create('div',d,'position:relative;color:#e0e0e0;padding:3px;');


menu.style.display=
pica.style.display=
bubble.style.display=
indicator.style.display=
indicator2.style.display=
indicator3.style.display=
indicator4.style.display=
indicator6.style.display=
indicator7.style.display=
pagecloak.style.display=
waitcloak.style.display=
invisibleBlanket.style.display= 'none';


palette=dom_create('div');
palette.style.display='none';
palette.style.position='fixed';
palette.style.zIndex=104;
palette.addEventListener('mouseover',paletteMover,false);
palette.addEventListener('mouseout',paletteMout,false);
palette.innerHTML='<div style="position:relative;width:l70px;height:100px;">\
<div style="position:absolute;left:0px;top:15px;background-color:black;opacity:0.7;width:170px;height:150px;border-top-left-radius:5px;border-top-right-radius:5px;-moz-border-radius-topleft:5px;-moz-border-radius-topright:5px;border-bottom:solid 1px #404040;"></div>\
<div style="position:absolute;left:0px;top:166px;background-color:black;opacity:0.6;width:170px;height:60px;border-bottom-left-radius:5px;border-bottom-right-radius:5px;-moz-border-radius-bottomleft:5px;-moz-border-radius-bottomright:5px;"></div>\
<table style="position:absolute;left:0px;top:15px;width:170px;height:150px;"><tr><td align=center valign=middle style="width:270px:">\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#ff0000;">red</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#008000;">green</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#0000ff;">blue</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#ffff00;color:#858585;">yellow</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#800000;">maroon</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#808000;">olive</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#ffa500;">orange</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#008080;">teal</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#ff00ff;">fuchsia</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#6a5acd;">slateblue</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#4b0082;">indigo</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#a52a2a;">brown</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#DC143C;">crimson</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#8A2BE2;">bluevelvet</div>\
<div class=palettedye onclick=palettedyeclick(event) style="background-color:#696969;">dimgray</div>\
</td></tr></table>\
<div style="position:absolute;left:20px;top:172px;">\
<div style="position:relative;width:110px;">\
<canvas id=palettegrove width=100 height=20 style="position:absolute;left:13px;top:18px;" onclick=palettegrove_click(event)></canvas>\
<canvas id=paletteslider width=26 height=26 style="position:absolute;left:50px;top:0px;cursor:pointer;" onmousedown=palettesliderMD(event)></canvas>\
</div>\
</div>\
</div>';
palette.grove = document.getElementById('palettegrove');
palette.slider = document.getElementById('paletteslider');
/*
var c = document.getElementById("palettepointer");
var ctx = c.getContext("2d");
ctx.fillStyle = "black";
ctx.beginPath();
ctx.moveTo(0, 15);
ctx.lineTo(18,0);
ctx.lineTo(35,15);
ctx.fill();
*/
var c = document.getElementById('paletteslider');
ctx = c.getContext("2d");
lg = ctx.createLinearGradient(0,0,0,30);
lg.addColorStop(0, "#c3c3c3");
lg.addColorStop(1, "#707070");
ctx.fillStyle = lg;
ctx.moveTo(0,0);ctx.lineTo(26,0);ctx.lineTo(26,13);ctx.lineTo(13,23);ctx.lineTo(0,13);ctx.lineTo(0,0);ctx.fill();

menu2=document.createElement('div');
document.body.appendChild(menu2);
menu2.style.position='absolute';
menu2.style.backgroundColor='#ededed';
menu2.style.zIndex=104;
menu2.addEventListener('mouseover',menu2_mover,false);
menu2.addEventListener('mouseout',menu2_mout,false);

glasspane=dom_create('canvas',null,'position:absolute;z-index:101;display:none;');
glasspane.ctx=glasspane.getContext('2d');
smear1=dom_create('canvas',null,'position:absolute;z-index:101;display:none;');
smear1.ctx=smear1.getContext('2d');
smear2=dom_create('canvas',null,'position:absolute;z-index:101;display:none;');
smear2.ctx=smear2.getContext('2d');

alertbox=dom_create('div',document.body,'position:fixed;top:0px;padding:5px 13px;z-index:101;cursor:default;display:none;');
alertbox.innerHTML=0;
alertbox.messages=[];
alertbox.addEventListener('click',alertbox_click,false);
alertbox.title='Click to see messages';
}


function alertbox_addmsg(stuff)
{
/* stuff.bgcolor, bg
stuff.color, text
stuff.text
*/
if(!stuff.bgcolor) {
	stuff.bgcolor='#900';
	stuff.color='white';
}
alertbox.style.backgroundColor=stuff.bgcolor;
alertbox.style.color=stuff.color;
var i=parseInt(alertbox.innerHTML);
alertbox.innerHTML=i+1;
alertbox.messages.push(stuff);
alertbox.style.display='block';
if(typeof(floatingtoolbox)=='undefined') {
	alertbox.style.left='';
	alertbox.style.right=0;
} else {
	alertbox.style.left=parseInt(floatingtoolbox.style.left)-40;
	alertbox.style.right='';
}
}

function alertbox_click(event)
{
menu_blank();
menu_show(0,event.clientX,event.clientY);
for(var i=0; i<alertbox.messages.length; i++) {
	var m=alertbox.messages[i];
	var d=dom_create('div',menu.c32,'margin:10px;padding:5px 10px;border-left:solid 2px '+m.bgcolor);
	d.innerHTML=m.text;
	if(m.refreshcachehandle) {
		d.appendChild(m.refreshcachehandle);
	}
}
alertbox.style.display='none';
alertbox.innerHTML=0;
alertbox.messages=[];
}




function menu_smoothwindow_checkbox()
{
// change checkbox on the menu
var bbj=gflag.menu.bbj;
var tklst=bbj.tklstfrommenu();
if(menu.c46.checkbox.checked) {
	menu.c46.div.style.display='block';
	menu.c46.says.innerHTML='5-pixel window';
} else {
	menu.c46.div.style.display='none';
}
menu_update_track(8);
}

function menu_smoothwindow_change(event)
{
var v=parseInt(menu.c46.says.innerHTML);
if(isNaN(v)) {
	v=5;
} else {
	v=Math.max(3,v+event.target.change);
}
menu.c46.says.innerHTML=v+'-pixel window';
menu_update_track(8);
}




function menu_tkbg_change()
{
// from config menu
var usebg=menu.c44.checkbox.checked;
var bg=null;
if(usebg) {
	menu.c44.color.style.display='block';
	bg=menu.c44.color.style.backgroundColor;
} else {
	menu.c44.color.style.display='none';
}
menu_update_track(38);
}

function menu_tkcurveonly_change()
{
menu_update_track(40);
}

function menu_barplotbg_change()
{
// from config menu
var usebg=menu.c29.checkbox.checked;
var bg=null;
if(usebg) {
	menu.c29.color.style.display='block';
	bg=menu.c29.color.style.backgroundColor;
} else {
	menu.c29.color.style.display='none';
}
menu_update_track(37);
}

function menu_hammock_choosescore(event)
{
gflag.menu.hammock_focus={scoreidx:event.target.idx};
menu_update_track(30);
}


function menu2_show() {
menu2.style.display='block';
document.body.addEventListener('mousedown',menu2_hide,false);
}
function menu2_hide() {
menu2.style.display='none';
document.body.removeEventListener('mousedown',menu2_hide,false);
}
function menu2_mover(event) {
document.body.removeEventListener('mousedown',menu_hide,false);
document.body.removeEventListener('mousedown',menu2_hide,false);
}
function menu2_mout(event) {
document.body.addEventListener('mousedown',menu_hide,false);
document.body.addEventListener('mousedown',menu2_hide,false);
}
function menu2ele_click(event)
{
menu2_hide();
menu.relocate.gene.value=event.target.genename;
menuJump();
}




function qtrack_logtransform(data,_qtc)
{
/* data is nested array
returns new vector same as data
*/
if(_qtc.logtype==undefined ||_qtc.logtype==log_no) return data;
var nd = [];
for(var i=0; i<data.length; i++) {
	nd.push([]);
}
for(i=0; i<data.length; i++) {
	for(var j=0; j<data[i].length; j++) {
		switch(_qtc.logtype) {
		case log_2:
			nd[i][j] = Math.log(data[i][j]) * Math.LOG2E;
			break;
		case log_e:
			nd[i][j] = Math.log(data[i][j]);
			break;
		case log_10:
			nd[i][j] = Math.log(data[i][j]) * Math.LOG10E;
			break;
		default: fatalError('unknown log type');
		}
	}
}
return nd;
}

Browser.prototype.get_tkyscale=function(tk)
{
/* only from view range
do not deal with tkgroup, only get it from data
*/
if(tk.ft==FT_matplot) {
	return this.tklst_yscale(tk.tracks);
}
if(isNumerical(tk)) {
	var data2= qtrack_logtransform(tk.data, tk.qtc);
	return qtrack_getthreshold(data2, tk.qtc, this.dspBoundary.vstartr, this.dspBoundary.vstopr, this.dspBoundary.vstarts, this.dspBoundary.vstops);
}
if(tk.showscoreidx!=undefined && tk.showscoreidx>=0) {
	var scale=tk.scorescalelst[tk.showscoreidx];
	if(scale.type==scale_auto) {
		var s_max=s_min=null;
		for(var i=this.dspBoundary.vstartr; i<=this.dspBoundary.vstopr; i++) {
			for(var j=0; j<tk.data[i].length; j++) {
				var item = tk.data[i][j];
				if(item.boxstart==undefined || item.boxwidth==undefined || !item.scorelst || item.scorelst.length==0) continue;
				if(item.boxstart>this.hmSpan-this.move.styleLeft || item.boxstart+item.boxwidth<-this.move.styleLeft) continue;
				var s= item.scorelst[tk.showscoreidx];
				if(s_max==null || s_max<s) {
					s_max=s;
				}
				if(s_min==null || s_min>s) {
					s_min=s;
				}
			}
		}
		// TODO make it an option: 0-based or dynamic range
		if(s_min>0) { s_min=0; }
		return [s_max,s_min];
	} else {
		return [scale.max,scale.min];
	}
}
return [null,null]
}


Browser.prototype.set_tkYscale=function(tk)
{
if(tk.group!=undefined) {
	// group scale should have been computed
	var t=this.tkgroup[tk.group];
	tk.maxv=t.max;
	tk.minv=t.min;
	return;
}
var max,min;
if(this.trunk) {
	// one splinter
	var tmp=this.get_tkyscale(tk);
	max=tmp[0];
	min=tmp[1];
	var _o= this.trunk.findTrack(tk.name);
	if(_o) {
		tmp=this.trunk.get_tkyscale(_o);
		max=Math.max(max,tmp[0]);
		min=Math.min(min,tmp[1]);
	}
	for(var h in this.trunk.splinters) {
		if(h!=this.horcrux) {
			var b=this.trunk.splinters[h];
			_o= b.findTrack(tk.name);
			if(_o) {
				tmp=b.get_tkyscale(_o);
				max=Math.max(max,tmp[0]);
				min=Math.min(min,tmp[1]);
			}
		}
	}
} else {
	// is trunk
	var tmp=this.get_tkyscale(tk);
	max=tmp[0];
	min=tmp[1];
	for(var h in this.splinters) {
		var b=this.splinters[h];
		var _o= b.findTrack(tk.name);
		if(_o) {
			tmp=b.get_tkyscale(_o);
			max=Math.max(max,tmp[0]);
			min=Math.min(min,tmp[1]);
		}
	}
}
/*
if(max>0) {
	if(min>0) {
	} else {
		min=0;
	}
} else {
	max=0;
}
*/
tk.maxv=max;
tk.minv=min;
}

function qtrack_getthreshold(data, qtconfig, startRidx, stopRidx, startDidx, stopDidx)
{
/* figure out threshold for a quantitative track for plotting
compute for positive/negative data separately
if not using threshold, use max value

args:
data: nested array
qtconfig is qtc object of the track
startRidx/stopRidx: data array index
startDidx/stopDidx: data[x] array index
*/
if(qtconfig.thtype == scale_fix) {
	return [qtconfig.thmax, qtconfig.thmin];
}
var pth; // positive threshold value
var nth; // negative
if(qtconfig.thtype == scale_percentile) {
	/*** fixed percentile ***/
	var plst = []; var nlst = [];
	for(var i=startRidx; i<=stopRidx; i++) {
		var start = (i==startRidx) ? startDidx : 0;
		var stop = (i==stopRidx) ? stopDidx : data[i].length;
		for(var j=start; j<stop; j++) {
			var v = data[i][j];
			if(isNaN(v) || v==Infinity || v==-Infinity) {
			} else if(v > 0) {
				plst.push(v);
			} else if(v < 0) {
				nlst.push(v);
			}
		}
	}
	if(plst.length > 0) {
		plst.sort(numSort);
		var n = parseInt(plst.length*qtconfig.thpercentile/100);
		if(n >= plst.length)
			n = plst.length - 1;
		pth = plst[n];
	} else {
		pth = 0;
	}
	if(nlst.length > 0) {
		nlst.sort(numSort);
		var n = parseInt(nlst.length * (100-qtconfig.thpercentile)/100);
		if(n < 0) n = 0;
		nth = nlst[n];
	} else {
		nth = 0;
	}
} else if(qtconfig.thtype == scale_auto){
	/*** auto scale
	bug fixed 2013/9/18
	originally set nth=0, but all values are >0 so nth never set to true min
	***/
	pth=null; nth=null;
	for(var i=startRidx; i<=stopRidx; i++) {
		//if(!data[i]) fatalError(i);
		var start = (i==startRidx) ? startDidx : 0;
		var stop = (i==stopRidx) ? stopDidx : data[i].length;
		for(var j=start; j<stop; j++) {
			var v = data[i][j];
			if(isNaN(v) || v==Infinity || v==-Infinity) {
			} else {
				if(pth==null) {
					pth=v;
				} else if(v>pth) {
					pth=v;
				}
				if(nth==null) {
					nth=v;
				} else if(v<nth) {
					nth=v;
				}
			}
		}
		if(qtconfig.min_fixed!=undefined) {
			nth=Math.max(qtconfig.min_fixed,nth);
		}
		if(qtconfig.max_fixed!=undefined) {
			pth=Math.min(qtconfig.max_fixed,pth);
		}
		if(pth<nth) {
			pth=nth;
		}
	}
} else {
	fatalError("qtrack_getthreshold: unknown threshold type");
}
return [pth, nth];
}

function qtcpanel_setdisplay(pm)
{
// color
menu.c50.style.display = "block";
menu.c50.row2.style.display='none';
if(pm.color1) {
	menu.c50.color1.style.display='inline-block';
	menu.c50.color1.innerHTML=pm.color1text?pm.color1text:'choose color';
	menu.c50.color1.style.backgroundColor=pm.color1;
} else {
	menu.c50.color1.style.display='none';
}
if(pm.color2) {
	menu.c50.row2.style.display='block';
	menu.c50.color2.style.display='inline-block';
	menu.c50.color2.innerHTML=pm.color2text?pm.color2text:'choose color';
	menu.c50.color2.style.backgroundColor=pm.color2;
} else {
	menu.c50.color2.style.display='none';
}
menu.c50.color1_1.style.display=menu.c50.color2_1.style.display='none';
if(pm.qtc) {
	qtc_thresholdcolorcell(pm.qtc);
}
// scale
if(!pm.no_scale && pm.qtc && pm.qtc.thtype!=undefined) {
	menu.c51.style.display='block';
	menu.c51.fix.style.display=menu.c51.percentile.style.display='none';
	menu.c51.select.firstChild.text= pm.qtc.min_fixed!=undefined ? 'Auto (min set at '+pm.qtc.min_fixed+')' : (pm.qtc.max_fixed!=undefined ? 'Auto (max set at '+pm.qtc.max_fixed+')' : 'Automatic scale');
	switch(pm.qtc.thtype) {
	case scale_auto:
		menu.c51.select.selectedIndex=0;
		break;
	case scale_fix:
		menu.c51.select.selectedIndex=1;
		menu.c51.fix.style.display='block';
		menu.c51.fix.min.value=pm.qtc.thmin;
		menu.c51.fix.max.value=pm.qtc.thmax;
		break;
	case scale_percentile:
		menu.c51.select.selectedIndex=2;
		menu.c51.percentile.style.display='block';
		menu.c51.percentile.says.innerHTML=pm.qtc.thpercentile+' percentile';
		break;
	default: print2console('unknown scale type '+pm.qtc.thtype,2);
	}
} else {
	menu.c51.style.display='none';
}
// log
if(!pm.no_log && pm.qtc) {
	menu.c52.style.display='block';
	if(pm.qtc.logtype==undefined || pm.qtc.logtype==log_no) {
		menu.c52.select.selectedIndex=0;
	} else {
		menu.c52.select.selectedIndex=pm.qtc.logtype==log_2?1:(pm.qtc.logtype==log_e?2:3);
	}
} else {
	menu.c52.style.display='none';
}
// smoothing
if(!pm.no_smooth && pm.qtc) {
	menu.c46.style.display='block';
	if(pm.qtc.smooth==undefined) {
		menu.c46.checkbox.checked=false;
		menu.c46.div.style.display='none';
	} else {
		menu.c46.checkbox.checked=true;
		menu.c46.div.style.display='block';
		menu.c46.says.innerHTML=pm.qtc.smooth+'-pixel window';
	}
} else {
	menu.c46.style.display='none';
}
// summary method
if(pm.qtc && pm.qtc.summeth!=undefined) {
	menu.c59.style.display='block';
	menu.c59.select.selectedIndex= pm.qtc.summeth-1;
	menu.c59.select.options[3].disabled= (pm.ft==FT_bigwighmtk_n || pm.ft==FT_bigwighmtk_c);
}
if(pm.ft==FT_bedgraph_n||pm.ft==FT_bedgraph_c) {
	menu.c29.style.display='block';
	if(pm.qtc.barplotbg) {
		menu.c29.checkbox.checked=true;
		menu.c29.color.style.display='block';
		menu.c29.color.style.backgroundColor=pm.qtc.barplotbg;
	} else {
		menu.c29.checkbox.checked=false;
		menu.c29.color.style.display='none';
	}
}
if(menu.c66) {
	menu.c66.style.display='block';
	menu.c66.checkbox.checked=pm.qtc.curveonly;
}
}

function qtc_paramCopy(from,to) {
/* 'from' 'to' are qtc objects (or equipped with same attributes)
copy values from one to the other */
	for(var p in from) to[p] = from[p];
}


Browser.prototype.trackHeightChanged=function()
{
/* call this whenever track height is changed, any one of them
*/
if(!this.hmdiv) return;
this.hmdiv.parentNode.style.height=this.hmdiv.clientHeight;
//if(this.mcm) this.mcmPlaceheader();
if(this.decordiv) {
	this.decordiv.parentNode.style.height=this.decordiv.clientHeight;
}
if(this.onupdatey) {
	this.onupdatey(this);
}
}


/*** __render__ ends ***/




/*** __navi__ navigator ***/

Browser.prototype.clicknavibutt=function(param)
{
if(this.is_gsv()) {
	if(param && param.d) {
		param.d.innerHTML='working...';
	}
	this.gsv_turnoff();
	return;
}
var p2={};
if(param.d) {
	p2.d=param.d;
} else {
	p2.x=param.x;
	p2.y=param.y;
}
p2.showchr=this.navigator?false:true;
this.showjumpui(p2);
menu.relocate.coord.focus();
}

Browser.prototype.drawNavigator=function()
{
var _n=this.navigator;
if(!_n || !_n.canvas) return;
_n.blockwidth=[];
_n.blocks=[]; // don't use during gsv
var c=_n.canvas;
c.height=_n.chrbarheight+2*_n.hlspacing+2+_n.rulerheight;
var ctx=c.getContext('2d');
ctx.clearRect(0,0,c.width, c.height);
if(this.is_gsv()) {
	var _s=this.genesetview;
	var lst=_s.lst;
	var totalbp=0;
	for(var i=0; i<lst.length; i++) {
		totalbp+=lst[i].stop-lst[i].start;
	}
	_n.totalbp=totalbp;
	_s.lstsf=totalbp/c.width;
	if(this.juxtaposition.type==RM_protein) {
		/* draw box for protein, which is collection of exon, partly duplicates
		gene exons are to be in good order
		*/
		var pastgene=_s.exon2gene[lst[0].name];
		var a=true;
		var x1=0;
		var x2=(lst[0].stop-lst[0].start)/_s.lstsf;
		for(var i=1; i<lst.length; i++) {
			var w=(lst[i].stop-lst[i].start)/_s.lstsf;
			_n.blockwidth.push(w);
			var thisgene=_s.exon2gene[lst[i].name];
			if(thisgene==pastgene) {
				x2+=w;
			} else {
				ctx.fillStyle=a?_s.minichr_filla : _s.minichr_fillb;
				a=!a;
				ctx.fillRect(x1,_n.hlspacing+1,x2-x1,_n.chrbarheight);
				var ww=ctx.measureText(pastgene).width;
				if(ww<x2-x1) {
					ctx.fillStyle=_s.minichr_text;
					ctx.fillText(pastgene,x1+(x2-x1-ww)/2,_n.hlspacing+12);
				}
				pastgene=thisgene;
				x1=x2;
				x2=x1+w;
			}
		}
		ctx.fillStyle=a?_s.minichr_filla : _s.minichr_fillb;
		ctx.fillRect(x1,_n.hlspacing+1,x2-x1,_n.chrbarheight);
		var ww=ctx.measureText(pastgene).width;
		if(ww<x2-x1) {
			ctx.fillStyle=_s.minichr_text;
			ctx.fillText(pastgene,x1+(x2-x1-ww)/2,_n.hlspacing+12);
		}
	} else {
		/* regular gsv
		see if all gsv items are in same chr, if so, draw the chr ideogram and mark items out as boxes
		var same_chr=true;
		if(same_chr) {
			return;
		}
		*/
		// not in same chr, draw all the gsv items
		var lst=_s.lst;
		var x=0;
		for(var i=0; i<lst.length; i++) {
			var tlen=lst[i].stop-lst[i].start;
			ctx.fillStyle = (i%2==0) ? _s.minichr_filla : _s.minichr_fillb;
			var w=tlen/_s.lstsf;
			_n.blockwidth.push(w);
			ctx.fillRect(x, _n.hlspacing+1, w, _n.chrbarheight);
			var w2=ctx.measureText(lst[i].name).width;
			if(w2<=w) {
				ctx.fillStyle=_s.minichr_text;
				ctx.fillText(lst[i].name,x+(w-w2)/2, _n.hlspacing+12);
			}
			x+=w;
		}
	}
	// highlight
	var vstartr_coord, vstopr_coord;
	var x=0;
	var r=this.regionLst[this.dspBoundary.vstartr];
	for(i=0; i<lst.length; i++) {
		if(lst[i].name==r[6]) {
			vstartr_coord=lst[i].start;
			break;
		}
		x+=_n.blockwidth[i];
	}
	// here must use r[7] but not this.entire.summarySize, why??
	x+=(r[3]+this.dspBoundary.vstarts*(this.entire.atbplevel?1:r[7])-vstartr_coord)/_s.lstsf;
	var x2=0;
	r=this.regionLst[this.dspBoundary.vstopr];
	for(i=0; i<lst.length; i++) {
		if(lst[i].name==r[6]) {
			vstopr_coord=lst[i].start;
			break;
		}
		x2+=_n.blockwidth[i];
	}
	x2+=(r[3]+this.dspBoundary.vstops*(this.entire.atbplevel?1:r[7])-vstopr_coord)/_s.lstsf;
	// blue box
	ctx.strokeStyle='blue';
	ctx.strokeRect(x==0?0:x-.5, .5, x2-x, _n.chrbarheight+1+2*_n.hlspacing);
	return;
}
var chrlst=[this.regionLst[this.dspBoundary.vstartr][0]];
for(var i=this.dspBoundary.vstartr+1; i<=this.dspBoundary.vstopr; i++) {
	if(!thinginlist(this.regionLst[i][0],chrlst))
		chrlst.push(this.regionLst[i][0]);
}
var totalbp=0;
for(i=0; i<chrlst.length; i++) {
	totalbp+=this.genome.scaffold.len[chrlst[i]];
}
_n.totalbp=totalbp;
var x=0;
var lastchrxoffset=0, firstchrwidth=0, lastchrwidth=0;
var imagewidth=c.width;
for(i=0; i<chrlst.length; i++) {
	var chrlen=this.genome.scaffold.len[chrlst[i]];
	var w=chrlen*(imagewidth-chrlst.length-1)/totalbp;
	_n.blockwidth.push(w);
	_n.blocks.push([chrlst[i],0,chrlen]);
	if(i==0) firstchrwidth=w;
	if(i==chrlst.length-1) lastchrwidth=w;
	lastchrxoffset=x+1;
	drawIdeogramSegment_simple(
		this.genome.getcytoband4region2plot(chrlst[i], 0, this.genome.scaffold.len[chrlst[i]], w),
		ctx, x, _n.hlspacing+1, w, ideoHeight, false);
	x+=w+1;
}
// blue box
var r=this.regionLst[this.dspBoundary.vstartr];
var coord=r[3]+this.dspBoundary.vstarts*(this.entire.atbplevel?1:this.entire.summarySize);
var hlstart=parseInt(coord*firstchrwidth/this.genome.scaffold.len[r[0]]);
r=this.regionLst[this.dspBoundary.vstopr];
coord=r[3]+this.dspBoundary.vstops*(this.entire.atbplevel?1:this.entire.summarySize);
var hlstop=Math.max(hlstart+1,parseInt(lastchrxoffset+coord*lastchrwidth/this.genome.scaffold.len[r[0]]));
ctx.strokeStyle='blue';
ctx.strokeRect(Math.max(0,hlstart-.5), .5, hlstop-hlstart, _n.chrbarheight+2*_n.hlspacing+1);
// ruler
if(_n.show_ruler && chrlst.length==1 && _n.rulerheight>0) {
	var chrlen=this.genome.scaffold.len[chrlst[0]];
	ctx.fillStyle=colorCentral.foreground_faint_5;
	drawRuler_basepair(ctx, chrlen, imagewidth, 0, _n.chrbarheight+2*_n.hlspacing+4);
}
}

function drawRuler_basepair(ctx, bplen, plotwidth, x, y)
{
/* draw horizontal basepair ruler
canvas height is fixed to 20px
color must already been set
*/
var sf = plotwidth / bplen;
var ulst = ['','0','00','K','0K','00K','M','0M','00M'];
var k = -1;
for(var i=ulst.length-1; i>=0; i--) {
	if(Math.pow(10,i)*2 < bplen) {
		k = i;
		break;
	}
}
if(k == -1) {
	print2console('cannot draw ideogram ruler', 2);
	return;
}
var ulen = Math.pow(10,k); // unit bp length
var unum = parseInt(bplen / ulen);
var uplot = ulen * sf; // unit plot width
ctx.fillRect(0,y,uplot*unum,1);
ctx.fillRect(0,y,1,5);
ctx.fillText(0,0,y+15);
var x = 0;
var lasttextpos=0;
for(i=1; i<=unum; i++) {
	ctx.fillRect(x+uplot/4,y,1,4); // 1st quarter
	ctx.fillRect(x+uplot/2,y,1,4); // half
	ctx.fillRect(x+uplot*3/4,y,1,4); // 3rd quarter
	ctx.fillRect(x+uplot, y, 1, 5);
	var w = i.toString()+ulst[k];
	var ww = ctx.measureText(w).width;
	x += uplot;
	if(x>lasttextpos+ww+3) {
		ctx.fillText(w, i==unum ? x-ww+1 : x-ww/2,15+y);
		lasttextpos=x;
	}
}
}


Browser.prototype.navigatorSeek=function(x)
{
// return [chr/item name, coord]
if(this.is_gsv()) {
	var cx=0;
	for(var i=0; i<this.navigator.blockwidth.length; i++) {
		var thisx=this.navigator.blockwidth[i];
		if(cx+thisx>=x) {
			var b=this.genesetview.lst[i];
			return [b.name, b.start+parseInt((b.stop-b.start)*(x-cx)/thisx)];
		}
		cx+=thisx;
	}
	return [this.genesetview.lst[i-1].name, this.genesetview.lst[i-1].stop];
}
var cx=0;
for(var i=0; i<this.navigator.blockwidth.length; i++) {
	var thisx=this.navigator.blockwidth[i];
	if(cx+thisx>=x) {
		var b=this.navigator.blocks[i];
		return [b[0], parseInt((b[2]-b[1])*(x-cx)/thisx)];
	}
	cx+=thisx;
}
return [this.navigator.blocks[i-1][0], this.navigator.blocks[i-1][2]];
}
function navigator_tooltip(event)
{
var bbj=gflag.browser;
if(bbj.juxtaposition.type==RM_protein) return;
var pos=absolutePosition(event.target);
pica_go(event.clientX,pos[1]+event.target.clientHeight-document.body.scrollTop-13);
var x=event.clientX+document.body.scrollLeft-pos[0]; // offset on canvas
var re=bbj.navigatorSeek(x);
picasays.innerHTML=re[0]+', '+re[1];
}

function navigatorMD(event)
{
/* both on trunk and spliter
*/
if(event.button != 0) return; // only process left click
event.preventDefault();
var pos = absolutePosition(event.target);
indicator.style.display = "block";
indicator.style.left = event.clientX + document.body.scrollLeft;
indicator.style.top = pos[1];
indicator.style.width = 1;
indicator.style.height = event.target.clientHeight;
gflag.navigator={
	bbj:gflag.browser,
	canvas:event.target,
	x:event.clientX+document.body.scrollLeft,
	xcurb:pos[0]};
document.body.addEventListener("mousemove", navigatorM, false);
document.body.addEventListener("mouseup", navigatorMU, false);
}
function navigatorM(event)
{
var currx = event.clientX + document.body.scrollLeft;
var n=gflag.navigator;
if(currx > n.x) {
	if(currx < n.xcurb+n.canvas.width) {
		indicator.style.width = currx - n.x;
	}
} else {
	if(currx >= n.xcurb) {
		indicator.style.width = n.x - currx;
		indicator.style.left = currx;
	}
}
}

function navigatorMU(event)
{
document.body.removeEventListener("mousemove", navigatorM, false);
document.body.removeEventListener("mouseup", navigatorMU, false);
indicator.style.display='none';
var n=gflag.navigator;
var x = parseInt(indicator.style.left)-n.xcurb; // relative to minichr canvas div
var w = parseInt(indicator.style.width);
if(w==0) return;
var jt = n.bbj.juxtaposition.type;
var coord1=n.bbj.navigatorSeek(x);
var coord2=n.bbj.navigatorSeek(x+w);
if(coord1[0]==coord2[0] && coord1[1]==coord2[1]) return;

if(n.bbj.is_gsv()) {
	/* if selected region is too small to fit in the entire genomeheatmap,
	   need to expand it so it won't yield "truncated" hmtks
	 */
	var hmbp = n.bbj.hmSpan/MAXbpwidth_bold;
	var wbp = w*n.bbj.genesetview.lstsf; // bp spanned by indicator box
	if(wbp < hmbp) {
		var neww = Math.ceil(hmbp*this.genesetview.lstsf);
		x -= Math.ceil((neww-w)/2);
		w = neww;
		if(x < 0) {
			x = 0;
		} else if(x+w > this.navigator.canvas.width) {
			x = this.navigator.canvas.width-w;
		}
	}
	n.bbj.cloak();
	var samestring = "itemlist=on&imgAreaSelect=on&statusId="+n.bbj.statusId+
		"&startChr="+coord1[0]+"&startCoord="+coord1[1]+
		"&stopChr="+coord2[0]+"&stopCoord="+coord2[1]+
		(n.bbj.entire.atbplevel?'&atbplevel=on':'');
	n.bbj.ajaxX(samestring);
	return;
}
n.bbj.weavertoggle(n.bbj.navigator.totalbp*w/n.bbj.navigator.canvas.width);
var param='imgAreaSelect=on&'+n.bbj.runmode_param()+'&startChr='+coord1[0]+'&startCoord='+coord1[1]+'&stopChr='+coord2[0]+'&stopCoord='+coord2[1];
n.bbj.cloak();
n.bbj.ajaxX(param);
if(gflag.syncviewrange) {
	for(var i=0; i<gflag.syncviewrange.lst.length; i++) {
		gflag.syncviewrange.lst[i].ajaxX(param);
	}
}
}

/* c18_canvas, showing only one chr
*/
function c18_m_pica(event)
{
var c=event.target;
var p=absolutePosition(c);
picasays.innerHTML=c.chrom+' '+parseInt(c.bpperpx*(event.clientX+document.body.scrollLeft-p[0]));
pica_go(event.clientX,p[1]-document.body.scrollTop+c.height-10);
}

function c18_md(event)
{
if(event.button!=0) return;
event.preventDefault();
var pos = absolutePosition(event.target);
indicator.style.display='block';
indicator.style.left = event.clientX + document.body.scrollLeft;
indicator.style.top = pos[1];
indicator.style.width = 1;
indicator.style.height = event.target.clientHeight;
gflag.c18={
	canvas:event.target,
	x:event.clientX+document.body.scrollLeft,
	xcurb:pos[0]};
document.body.addEventListener('mousemove',c18_mm,false);
document.body.addEventListener('mouseup',c18_mu,false);
}
function c18_mm(event)
{
var currx = event.clientX + document.body.scrollLeft;
var n=gflag.c18;
if(currx > n.x) {
	if(currx < n.xcurb+n.canvas.width) {
		indicator.style.width = currx - n.x;
	}
} else {
	if(currx >= n.xcurb) {
		indicator.style.width = n.x - currx;
		indicator.style.left = currx;
	}
}
}
function c18_mu(event)
{
document.body.removeEventListener('mousemove',c18_mm,false);
document.body.removeEventListener('mouseup',c18_mu,false);
indicator.style.display='none';
var n=gflag.c18;
var x=parseInt(indicator.style.left)-n.xcurb;
var w=parseInt(indicator.style.width);
var sf=n.canvas.bpperpx;
var start=parseInt(sf*x);
var stop=parseInt(sf*(x+w));
if(n.canvas.context==1) {
	var bbj=gflag.menu.bbj;
	var coord=menu.c18_canvas.chrom+':'+start+'-'+stop;
	gflag.menu.bbj.cgiJump2coord(coord);
	if(gflag.syncviewrange) {
		var lst=gflag.syncviewrange.lst;
		for(var i=0; i<lst.length; i++) {
			lst[i].cgiJump2coord(coord);
		}
	}
} else if(n.canvas.context==2) {
	// circlet view
	var blob=n.canvas.hengeviewblob;
	var k=blob.viewkey;
	var vobj=apps.circlet.hash[k];
	var r=vobj.regions[blob.ridx];
	r.dstart=start;
	r.dstop=stop;
	hengeview_computeRegionRadian(k);
	hengeview_ajaxupdatepanel(k);
	vobj.bbj.genome.drawSinglechr_markInterval(n.canvas,r.chrom,r.dstart,r.dstop,13,2)
	menu.c1.innerHTML=r.chrom+':'+r.dstart+'-'+r.dstop;
}
}

Genome.prototype.drawSinglechr_markInterval=function(canvas,chrom,start,stop,chromheight,hlspacing)
{
/* chrom bar fills entire canvas, with a blue box marking out a region
args:
canvas: <dom>
chrom: name
start/stop: highlight position
chromheight: px of chr bar
hlspacing:
*/
var ctx=canvas.getContext('2d');
ctx.clearRect(0,0,canvas.width,canvas.height);
var cL=this.scaffold.len[chrom];
if(cL==undefined) {
	print2console('c18 cannot draw: unknown chr '+chrom,2);
	return;
}
if(start<0 || start>=cL || stop<=start || stop>cL) {
	// do not squawk, it could be splinter is showing data over two chromosomes!!
	return;
}
ctx.lineWidth=1;
drawIdeogramSegment_simple(
	this.getcytoband4region2plot(chrom, 0, cL, canvas.width-1),
	ctx, 0, hlspacing, canvas.width-1, chromheight, false);
var sf=canvas.width/cL;
ctx.strokeStyle='blue';
ctx.strokeRect(start*sf, .5, (stop-start)*sf, chromheight+2*hlspacing+1);
}


/*** __navi__ ends ***/







function ldtk_color_initiator(event)
{
paletteshow(event.clientX, event.clientY, 17);
palettegrove_paint(event.target.style.backgroundColor);
}
function ldtk_color_set()
{
// TODO ld no support for negative score
menu.c49.color.style.backgroundColor=palette.output;
var tk=gflag.menu.tklst[0];
var c=colorstr2int(palette.output);
tk.qtc.pr=c[0];
tk.qtc.pg=c[1];
tk.qtc.pb=c[2];
gflag.menu.bbj.updateTrack(tk,false);
}
function ldtk_ticksize(event)
{
var tk=gflag.menu.tklst[0];
tk.ld.ticksize=Math.max(2,tk.ld.ticksize+event.target.change);
gflag.menu.bbj.updateTrack(tk,true);
}
function ldtk_topheight(event)
{
var tk=gflag.menu.tklst[0];
tk.ld.topheight=Math.max(20,tk.ld.topheight+event.target.change);
gflag.menu.bbj.updateTrack(tk,true);
}


function plotGene(ctx,color,scolor,item,x,y,w,h,startcoord,stopcoord,tosvg)
{
/* plot an item with structure
note: some items have no structure, e.g. polyA signal
args:
color
scolor: counter color, doodling inside thick boxes
item (with .struct, .strand)
x/y/w/h - defines the plot box
startcoord/stopcoord - the start/stop coordinate of the plot box
tosvg
*/
var svgdata=[];
// backbone and strand arrows
ctx.strokeStyle = color;
var pos = itemcoord2plotbox(item.start,item.stop, startcoord, stopcoord, w);
if(pos[0]==-1) return;
pos[0]+=x;
var y2=y+h/2;
ctx.beginPath();
ctx.moveTo(pos[0],y2);
ctx.lineTo(pos[0]+pos[1],y2);
ctx.stroke();
if(tosvg) {
	svgdata.push({type:svgt_line,x1:pos[0],y1:y2,x2:pos[0]+pos[1],y2:y2,w:1,color:color});
}
var strand=item.strand?(item.strand=='.'?null:(item.strand=='>'||item.strand=='+')?'>':'<'):null;
if(strand) {
	var tmplst=decoritem_strokeStrandarrow(ctx, strand, pos[0],pos[1], y, h, color, tosvg);
	if(tosvg) {
		svgdata=svgdata.concat(tmplst);
	}
}
ctx.fillStyle = color;
if(item.struct && item.struct.thin) {
	for(var i=0; i<item.struct.thin.length; i++) {
		var t=item.struct.thin[i];
		var pos = itemcoord2plotbox(t[0],t[1], startcoord, stopcoord, w);
		if(pos[0] != -1) {
			var q1=x+pos[0],
				q2=y+instack_padding,
				q3=pos[1],
				q4=h-instack_padding*2;
			ctx.fillRect(q1,q2,q3,q4);
			if(tosvg) svgdata.push({type:svgt_rect,x:q1,y:q2,w:q3,h:q4,fill:color});
		}
	}
}
if(item.struct && item.struct.thick) {
	for(var i=0; i<item.struct.thick.length; i++) {
		var t=item.struct.thick[i];
		var pos = itemcoord2plotbox(t[0], t[1], startcoord, stopcoord, w);
		if(pos[0] != -1) {
			ctx.fillRect(x+pos[0], y, pos[1], h);
			if(tosvg) svgdata.push({type:svgt_rect,x:x+pos[0],y:y,w:pos[1],h:h,fill:color});
			if(strand) {
				var tmplst=decoritem_strokeStrandarrow(ctx, strand, x+pos[0]+2, pos[1]-4, y, h, scolor, tosvg);
				if(tosvg) svgdata=svgdata.concat(tmplst);
			}
		}
	}
}
if(tosvg) return svgdata;
}
function itemcoord2plotbox(itemstart,itemstop,boxstart,boxstop,boxpw)
{
/*
itemstart/itemstop: coord of item
boxstart/boxstop: coord of box
boxwidth: plot width of box
returns [xpos, plotwidth] in pixel
*/
if(itemstart>=boxstop || itemstop<=boxstart) return [-1,-1];
var sf=boxpw/(boxstop-boxstart); // px per bp
var _start=Math.max(itemstart,boxstart);
return [(_start-boxstart)*sf, Math.ceil((Math.min(itemstop,boxstop)-_start)*sf)];
}

Browser.prototype.plotSamread=function(ctx,rid,start,info,y,h,color,miscolor,tosvg)
{
/* plot a single read, not PE
start/stop: read alignment start/stop coord on reference, including soft clipping
info: {cigar:[], mismatch:xx,start,stop} (start/stop for aligned portion)
y
h
color: box fill color
miscolor: mismatch color
tosvg:
*/
var sdata=[];
var r=this.regionLst[rid];
var _c_d='rgba('+colorstr2int(color).join(',')+',0.3)';
var _c_g=colorCentral.foreground_faint_3; // gray
var coord=start;
for(var i=0; i<info.cigar.length; i++) {
	var op=info.cigar[i][0];
	var cl=info.cigar[i][1];
	if(op=='M') {
		var s=this.tkcd_box({
			ctx:ctx,
			rid:rid,
			start:Math.max(r[3],coord),
			stop:Math.min(r[4],coord+cl),
			viziblebox:true,
			y:y,
			h:h,
			fill:color,
			tosvg:tosvg,
		});
		if(tosvg) sdata=sdata.concat(s);
	} else if(op=='I') {
		// insertion
	} else if(op=='D') {
		// deletion
		var s=this.tkcd_box({
			ctx:ctx,
			rid:rid,
			start:Math.max(r[3],coord),
			stop:Math.min(r[4],coord+cl),
			y:y,
			h:h,
			fill:_c_d,
			tosvg:tosvg,
		});
		if(tosvg) sdata=sdata.concat(s);
	} else if(op=='S'||op=='H') {
		var s=this.tkcd_box({
			ctx:ctx,
			rid:rid,
			start:Math.max(r[3],coord),
			stop:Math.min(r[4],coord+cl),
			y:y,
			h:h,
			fill:_c_g,
			tosvg:tosvg,
		});
		if(tosvg) sdata=sdata.concat(s);
	} else if(op=='N') {
		// skip, intron in rna-seq
		var a=this.cumoffset(rid,Math.max(r[3],coord)),
			b=this.cumoffset(rid,Math.min(r[4],coord+cl));
		if(a>=0 && b>a) {
			ctx.fillStyle=_c_g;
			ctx.fillRect(a,y+parseInt(h/2),b-a,1);
			if(tosvg) sdata.push({type:svgt_line,
				x1:a, y1:y+parseInt(h/2),
				x2:b, y2:y+parseInt(h/2),
				w:1, color:_c_g});
		}
	}
	coord+=cl;
}
// mismatch
if(info.mismatch) {
	// need to see if there's clipping at begining
	coord=Math.max(start,r[3]);
	var op=info.cigar[0][0];
	if(op=='S') {
		coord+=info.cigar[0][1];
	}
	var str=info.mismatch.substr(1); // remove first Z
	var bpw=this.entire.atbplevel?this.entire.bpwidth:1;
	var plotlineonly= (h<8 || bpw<6);
	if(!plotlineonly) {
		ctx.font = "bold 8pt Sans-serif"
	}
	ctx.fillStyle=miscolor;
	var stroffset=0;
	var bpoffset=0;
	var tmpstr=str;
	var skipping=false;
	while(stroffset<str.length-1) {
		var n=parseInt(tmpstr);
		if(isNaN(n)) {
			// none digit cha
			var c=str[stroffset];
			if(c=='A'||c=='C'||c=='G'||c=='T') {
				if(!skipping) {
					// a mismatch
					var ch=info.seq.charAt(stroffset);
					var x=this.cumoffset(rid,coord+bpoffset);
					if(plotlineonly) {
						ctx.fillRect(x,y, bpw, h);
						if(tosvg) sdata.push({type:svgt_rect,x:x,y:y, w:bpw, h:h, fill:ctx.fillStyle});
					} else {
						ctx.fillText(info.seq.charAt(bpoffset), x, y+9);
						if(tosvg) sdata.push({type:svgt_text, x:x, y:y+9,
							text:info.seq.charAt(bpoffset),
							color:ctx.fillStyle});
					}
				}
				bpoffset++;
			} else {
				// weird char, do not handle FIXME
				skipping=true;
			}
			stroffset++;
		} else {
			bpoffset+=n;
			stroffset+=n.toString().length;
			skipping=false;
		}
		tmpstr=str.substr(stroffset);
	}
}
if(tosvg) return sdata;
}



function gfSort(a,b)
{
/* for genomic feature items in decor drawing
using on-canvas plotting position
item boxstart/boxwidth could be undefined
*/
if(a.boxstart == undefined) {
	if(b.boxstart == undefined) {
		return 0;
	} else {
		return -1;
	}
}
if(b.boxstart == undefined) return 1;
if(a.boxstart != b.boxstart) {
	return a.boxstart-b.boxstart;
} else if(a.boxwidth != b.boxwidth) {
	return b.boxwidth-a.boxwidth;
}
// a and b are same on start/width, see about score
if(a.__showscoreidx!=undefined) {
	return b.scorelst[a.__showscoreidx]-a.scorelst[a.__showscoreidx];
}
return 0;
}

function decoritem_strokeStrandarrow(ctx, strand, x, w, y, h, color, tosvg)
{
/* only for items in full decor track?
must already set strokeStyle
args:
ctx: 2d context, all path must already been closed
strand: '>' '<'
x: absolute x start on canvas
w: width to plot with
y: absolute y start
color: string, only to be used in svg output
tosvg: boolean
*/
if(w < instack_arrowwidth) return [];
var thisx = 0;
var num = 0;
while(thisx+instack_arrowwidth <= w) {
	thisx += instack_arrowwidth+instack_arrowspacing;
	num++;
}
if(num == 0) return [];
thisx = (w-instack_arrowwidth*num-instack_arrowspacing*(num-1))/2;
ctx.strokeStyle = color;
ctx.beginPath();
var svgdata=[];
for(var i=0; i<num; i++) {
	if(strand=='>'||strand=='+') {
		var x1=x+thisx,
			y1=y+instack_padding,
			x2=x+thisx+instack_arrowwidth,
			y2=y+h/2,
			y3=y+h-instack_padding;
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.lineTo(x1, y3);
		if(tosvg) {
			svgdata.push({type:svgt_line,x1:x1,y1:y1,x2:x2,y2:y2,color:ctx.strokeStyle});
			svgdata.push({type:svgt_line,x1:x2,y1:y2,x2:x1,y2:y3,color:ctx.strokeStyle});
		}
	} else {
		var x1=x+thisx+instack_arrowwidth,
			y1=y+instack_padding,
			x2=x+thisx,
			y2=y+h/2,
			y3=y+h-instack_padding;
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.lineTo(x1, y3);
		if(tosvg) {
			svgdata.push({type:svgt_line,x1:x1,y1:y1,x2:x2,y2:y2,color:ctx.strokeStyle});
			svgdata.push({type:svgt_line,x1:x2,y1:y2,x2:x1,y2:y3,color:ctx.strokeStyle});
		}
	}
	thisx += instack_arrowwidth+instack_arrowspacing;
}
// don't do closePath or will mess up
ctx.stroke();
if(tosvg) return svgdata;
}

function toggle20(event) {
// native decor, show/hide children tk by clicking on arrow in 
	var hook = event.target;
	var bait = event.target.parentNode.parentNode.nextSibling;
	if(bait.style.display == "none") {
		bait.style.display = "table-row";
		hook.style.transform=
		hook.style.mozTransform=
		hook.style.webkitTransform='rotate(-90deg)';
	} else {
		bait.style.display = "none";
		hook.style.transform=
		hook.style.mozTransform=
		hook.style.webkitTransform='rotate(90deg)';
	}
}



function cpmoveMD(event)
{
/* generic moving panel */
if(event.button != 0) return;
var tab = event.target;
while(tab.getAttribute('holderid')==null) tab=tab.parentNode;
event.preventDefault();
gflag.cpmove.dom = document.getElementById(tab.getAttribute('holderid'));
gflag.cpmove.oldx = event.clientX;
gflag.cpmove.oldy = event.clientY;
document.body.addEventListener('mousemove', cpmoveM, false);
document.body.addEventListener('mouseup', cpmoveMU, false);
}
function cpmoveM(event)
{
var d = gflag.cpmove.dom;
d.style.left = parseInt(d.style.left) + event.clientX - gflag.cpmove.oldx;
d.style.top = parseInt(d.style.top) + event.clientY - gflag.cpmove.oldy;
gflag.cpmove.oldx = event.clientX;
gflag.cpmove.oldy = event.clientY;
}
function cpmoveMU(event)
{
gflag.cpmove.dom = null;
document.body.removeEventListener('mousemove', cpmoveM, false);
document.body.removeEventListener('mouseup', cpmoveMU, false);
}


function placeIndicator3(x,y,w,h)
{
// place indicator3 at a place (x,y) with resizing (w,h)
indicator3.style.left = x;
indicator3.style.top = y;
var d = indicator3.firstChild;
d.style.width = w;
d.style.height = h;
var dd = d.firstChild;
dd.style.width = w;
dd.style.height = h;
dd = d.childNodes[1];
dd.style.width = w;
dd.style.height = h;
dd = d.childNodes[2];
dd.style.width = w;
dd.style.height = h;
dd = d.childNodes[3];
dd.style.width = w;
dd.style.height = h;
indicator3.style.display = "block";
}

function tkinfo_show_closure(bbj,tk) { return function(){bbj.tkinfo_show(tk);}; }
Browser.prototype.tkinfo_show=function(arg)
{
// registry obj for accessing md
var tk;
if(typeof(arg)=='string') {
	tk=this.genome.getTkregistryobj(arg);
	if(!tk) fatalError('no registry object found');
} else {
	tk=arg;
}
menu_blank();
var d=dom_create('div',menu.c32,'margin:10px;width:500px;');
if(tk.md && tk.md.length>0) {
	dom_create('div',d,'font-style:italic;color:'+colorCentral.foreground_faint_5).innerHTML='Metadata annotation';
	var d2=dom_create('div',d,'margin:10px');
	for(var i=0; i<tk.md.length; i++) {
		if(!tk.md[i]) continue;
		// i is mdidx
		var voc=gflag.mdlst[i];
		for(var term in tk.md[i]) {
			mdterm_print(d2,term,voc);
		}
	}
}
// general
if(tk.details) {
	var d2=dom_create('div',d,'margin-bottom:15px;width:480px;');
	tkinfo_print(tk.details,d2);
}
// processing
if(tk.details_analysis) {
	var d2=dom_create('div',d,'margin-bottom:15px;width:480px;');
	tkinfo_print(tk.details_analysis,d2);
}
var reg=this.genome.getTkregistryobj(tk.name);
if(reg && reg.detail_url) {
	var d9=dom_create('div',d,'margin-bottom:15px;width:480px;');
	d9.innerHTML='loading...';
	this.ajaxText('loaddatahub=on&url='+reg.detail_url, function(text){
		var j=parse_jsontext(text);
		if(!j) {
			d9.innerHTML='Cannot read file at '+reg.detail_url;
			return;
		}
		d9.style.overflowX='scroll';
		stripChild(d9,0);
		var table=dom_create('table',d9,'zoom:0.8;');
		var c=0;
		for(var n in j) {
			var tr=table.insertRow(-1);
			if(c%2==0) {
				tr.style.backgroundColor=colorCentral.foreground_faint_1;
			}
			var td=tr.insertCell(0);
			td.innerHTML=n;
			td=tr.insertCell(1);
			td.innerHTML=j[n];
			c++;
		}
	});
}
// other version, not in use
// geo
if(tk.geolst) {
	var d2=dom_create('div',d);
	d2.innerHTML='GEO record: ';
	for(var i=0; i<tk.geolst.length; i++) {
		d2.innerHTML+='<a href=http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc='+tk.geolst[i]+' target=_blank>'+tk.geolst[i]+'</a> ';
	}
}
if(tk.ft==FT_cm_c) {
	var t=dom_create('table',d,'margin-top:10px;');
	var td=t.insertRow(0).insertCell(0);
	td.colSpan=2;
	td.style.fontStyle='italic';
	td.style.color=colorCentral.foreground_faint_5;
	td.innerHTML='Member tracks:';
	for(var k in tk.cm.set) {
		// this is registry obj, value is tkname
		var x=this.findTrack(tk.cm.set[k]);
		if(!x) continue;
		var tr=t.insertRow(-1);
		tr.insertCell(0).innerHTML=x.label;
		tr.insertCell(1).innerHTML='<a href='+x.url+' target=_blank>'+(x.url.length>50?x.url.substr(0,50)+'...':x.url)+'</a>';
	}
} else if(tk.ft==FT_matplot) {
	var t=dom_create('table',d,'margin-top:10px;');
	var td=t.insertRow(0).insertCell(0);
	td.colSpan=2;
	td.style.fontStyle='italic';
	td.style.color=colorCentral.foreground_faint_5;
	td.innerHTML='Member tracks:';
	for(var k=0; k<tk.tracks.length; k++) {
		// this is registry obj, value is tkname
		var x=this.findTrack(tk.tracks[k]);
		if(!x) continue;
		var tr=t.insertRow(-1);
		tr.insertCell(0).innerHTML=x.label;
		td=tr.insertCell(1);
		if(isCustom(x.ft)) {
			td.innerHTML='<a href='+x.url+' target=_blank>'+(x.url.length>50?x.url.substr(0,50)+'...':x.url)+'</a>';
		}
	}
}
if(tk.url) {
	dom_create('div',d).innerHTML='File URL: <a href='+tk.url+' target=_blank>'+(tk.url.length>50?tk.url.substr(0,50)+'...':tk.url)+'</a>';
}
}

function generic_tkdetail(event)
{
var t=event.target;
menu_shutup();
menu_show_beneathdom(0,t);
gflag.browser.tkinfo_show(t.tkobj);
}
function hengeview_lrtkdetail(event)
{
var t=event.target;
menu_shutup();
menu_show_beneathdom(0,t);
apps.circlet.hash[t.viewkey].bbj.tkinfo_show(t.tkname);
}

function menuGetonetrackdetails()
{
menu_shutup();
gflag.menu.bbj.tkinfo_show(gflag.menu.tklst[0]);
}
function tkinfo_parse(text,hash)
{
var lst = text.split('; ');
for(var i=0; i<lst.length; i++) {
	var idx=lst[i].indexOf('=');
	if(idx==-1) continue;
	hash[lst[i].substr(0,idx)]=lst[i].substr(idx+1);
}
}
function tkinfo_print(hash,holder)
{
// make a row to hold text1 and text2 in two <td>
var i=0;
var table=dom_create('table',holder);
for(var key in hash) {
	var color=(i%2) ? colorCentral.foreground_faint_1 : '';
	i++;
	var tr = table.insertRow(-1);
	var td = tr.insertCell(0);
	td.style.fontSize = "12px";
	td.style.backgroundColor = color;
	td.innerHTML = key.replace(/\_/g, " ");
	tr.appendChild(td);
	td = tr.insertCell(1);
	td.style.fontSize = "12px";
	td.style.backgroundColor = color;
	td.innerHTML = hash[key];
}
if(i>20) {
	holder.style.overflowY='scroll';
	holder.style.height=200;
}
}



function qtc_thresholdcolorcell(_qtc)
{
if(!_qtc || _qtc.thtype==undefined ) return;
if(menu.c50.style.display=='none') return;
if(_qtc.thtype==scale_auto) {
	menu.c50.color1_1.style.display=menu.c50.color2_1.style.display='none';
	return;
}
if(menu.c50.color1.style.display!='none') {
	var c=menu.c50.color1_1;
	c.style.display='inline-block';
	c.innerHTML='beyond threshold';
	c.style.backgroundColor=_qtc.pth;
}
if(menu.c50.color2.style.display!='none') {
	var c=menu.c50.color2_1;
	c.style.display='inline-block';
	c.innerHTML='beyond threshold';
	c.style.backgroundColor=_qtc.nth;
}
}


function toggle26(event)
{
// toggle select, change Y axis scale type
menu.c51.fix.style.display=
menu.c51.percentile.style.display='none';
var v=parseInt(menu.c51.select.options[menu.c51.select.selectedIndex].value);
if(v==scale_fix) {
	menu.c51.fix.style.display='block';
	// do not apply until user push button
	return;
}
if(v==scale_auto) {
	menu.c50.color1_1.style.display=menu.c50.color2_1.style.display='none';
} else if(v==scale_percentile) {
	menu.c51.percentile.style.display='block';
	menu.c51.percentile.says.innerHTML='95 percentile';
}
menu_update_track(5);
}

function qtc_setfixscale_ku(event) {if(event.keyCode==13) qtc_setfixscale();}
function qtc_setfixscale()
{
// need to show beyond threshold color blobs
var min=parseFloat(menu.c51.fix.min.value);
if(isNaN(min)) {
	print2console('Invalid minimum value',2);
	return;
}
var max=parseFloat(menu.c51.fix.max.value);
if(isNaN(max)) {
	print2console('Invalid maximum value',2);
	return;
}
if(min>=max) {
	print2console('min >= max',2);
	return;
}
menu_update_track(6);
}



function menu_log_select() { menu_update_track(9);}
function menu_qtksummary_select() {menu_update_track(32);}


/*** __qtc__ ***/

function qtc2json(q)
{
var lst = [];
for(var attr in q) {
	var v = q[attr];
	lst.push(attr+':'+(typeof(v)=='string'?'"'+v+'"':v));
}
return '{'+lst.join(',')+'}';
}


function qtc_color1_initiator(event)
{
paletteshow(event.clientX, event.clientY, 30);
palettegrove_paint(event.target.style.backgroundColor);
}
function qtc_color2_initiator(event)
{
paletteshow(event.clientX, event.clientY, 31);
palettegrove_paint(event.target.style.backgroundColor);
}
function qtc_color1_1_initiator(event)
{
paletteshow(event.clientX, event.clientY, 32);
palettegrove_paint(event.target.style.backgroundColor);
}
function qtc_color2_1_initiator(event)
{
paletteshow(event.clientX, event.clientY, 33);
palettegrove_paint(event.target.style.backgroundColor);
}

function indicator3cover(bbj)
{
var c = absolutePosition(bbj.hmdiv.parentNode);
placeIndicator3(c[0], c[1], bbj.hmSpan,
	bbj.hmdiv.clientHeight+bbj.ideogram.canvas.height+bbj.decordiv.clientHeight+bbj.tklst.length);
}

function toggle15(event)
{
/* called by changing "apply to all tracks" checkbox in qtc panel
only for browser tk, not bev or such
when changing it, do not automatically apply style...
*/
var bbj=gflag.menu.bbj;
if(event.target.checked) {
	indicator3cover(bbj);
	menu.c14.unify.style.display= bbj.tklst.length>1 ? 'table-cell' : 'none';
} else {
	bbj.highlighttrack(gflag.menu.tklst);
	menu.c14.unify.style.display=gflag.menu.tklst.length>1?'table-cell':'none';
}
}




function menu_tkh_change(event)
{
/* called by pushing buttons in menu: increase, decrease, unify
centralized place to process track height change, by .menu.context:
- browser track
- wreath track
- bev track
*/
var changetype=event.target.changetype;
var bbj=gflag.menu.bbj;
if(bbj.trunk) bbj=bbj.trunk;
switch(gflag.menu.context) {
case 1:
case 2:
	// configuring browser track
	var gooverlst=bbj.tklstfrommenu();
	var gooverlst2=null;
	var changeamount=null;
	if(changetype==1) {
		gooverlst2=gooverlst;
		changeamount=event.target.amount;
	} else if(changetype==2) {
		/* find a consensus height and set everybody to it
		for numerical and cat: find and use a height most commonly used
		if mixed numerical and lr, only do numerical
		for lr:
		*/
		var h_nc={}; // px height of numerical and cat
		var tklst_nc=[];
		var h_lr={}; // anglescale of lr
		var tklst_lr=[];
		for(var i=0; i<gooverlst.length; i++) {
			var tk=gooverlst[i];
			if(isNumerical(tk) || tk.ft==FT_cat_n || tk.ft==FT_cat_c || tk.ft==FT_catmat || tk.ft==FT_qcats || tk.ft==FT_weaver_c || tk.mode==M_bar) {
				tklst_nc.push(tk);
				var h=tk.qtc.height;
				if(h in h_nc) h_nc[h]++;
				else h_nc[h]=1;
			} else if(tk.ft==FT_lr_c || tk.ft==FT_lr_n) {
				tklst_lr.push(tk);
				var s=tk.qtc.anglescale;
				if(s in h_lr) h_lr[s]++;
				else h_lr[s]=1;
			}
		}
		if(tklst_nc.length>0) {
			var mcount=0, mheight=0;
			for(var h in h_nc) {
				if(h_nc[h]>mcount) {
					mcount=h_nc[h];
					/* 2013-3-20 confusing bug at vizbi
					when number is used as object attr, it is converted to string
					*/
					mheight=parseInt(h);
				}
			}
			gooverlst2=tklst_nc;
			changeamount=mheight;
		} else if(tklst_lr.length>0) {
			var mcount=0, mheight=0;
			for(var h in h_lr) {
				if(h_lr[h]>mcount) {
					mcount=h_lr[h];
					mheight=parseFloat(h);
				}
			}
			gooverlst2=tklst_lr;
			changeamount=mheight;
		}
	} else {
		return;
	}
	if(gooverlst2==null) return;
	if(gooverlst2.length==0) return;
	bbj.tkgrp_heightchange(gooverlst2, changetype, changeamount);
	for(var i=0; i<gooverlst2.length; i++) {
		bbj.updateTrack(gooverlst2[i],true);
	}
	return;
case 19:
	// wreath, for 1 track
	var obj=apps.circlet.hash[gflag.menu.viewkey].wreath[gflag.menu.wreathIdx];
	obj.qtc.height=Math.max(10,obj.qtc.height+event.target.amount);
	hengeview_draw(gflag.menu.viewkey);
	return;
case 20:
	// bev, always only one
	var obj=bbj.genome.bev.tklst[gflag.menu.bevtkidx];
	obj.qtc.height=Math.max(10,obj.qtc.height+event.target.amount);
	bbj.genome.bev_draw_track(obj);
	return;
default: fatalError('uknown menu context');
}
}

Browser.prototype.tkgrp_heightchange=function(_tklst,type,amount)
{
/* change height of a group of tracks
args:
_tklst
type:
	1 increase or reduce height by a given amount
	2 set all heights to the amount
*/
for(var i=0; i<_tklst.length; i++) {
	var tk=_tklst[i];
	if(isNumerical(tk) || tk.ft==FT_cat_n || tk.ft==FT_cat_c || tk.ft==FT_qcats || tk.ft==FT_matplot || tk.ft==FT_cm_c || tk.ft==FT_weaver_c || tk.mode==M_bar) {
		// set by .qtc.height
		if(type==1) {
			tk.qtc.height=Math.max(3,tk.qtc.height+amount);
		} else {
			tk.qtc.height=amount;
		}
		for(var a in this.splinters) {
			var t2=this.splinters[a].findTrack(tk.name);
			if(!t2) continue;
			t2.qtc.height=tk.qtc.height;
		}
	} else if(tk.ft==FT_catmat) {
		tk.rowheight=Math.max(1,tk.rowheight+(amount>0?1:-1));
		tk.qtc.height=1+tk.rowheight*tk.rowcount;
	} else if(tk.ft==FT_lr_c || tk.ft==FT_lr_n || tk.ft==FT_ld_c||tk.ft==FT_ld_n) {
		// set by .qtc.anglescale
		if(type==1) {
			if(amount>=1 || amount<=-1) amount/=50;
			var v=tk.qtc.anglescale+amount;
			if(v<0.5) v=0.5;
			else if(v>1) v=1;
			tk.qtc.anglescale=v;
		} else {
			tk.qtc.anglescale=amount;
		}
		for(var a in this.splinters) {
			var t2=this.splinters[a].findTrack(tk.name);
			if(!t2) continue;
			t2.qtc.anglescale=tk.qtc.anglescale;
		}
	}
}
}


function qtc_percentile(event)
{
// clicking button to change y scale percentile
var v=parseInt(menu.c51.percentile.says.innerHTML);
v+=event.target.change;
if(v<0) v=0;
else if(v>100) v=100;
menu.c51.percentile.says.innerHTML=v+' percentile';
menu_update_track(7);
}



Browser.prototype.tklstfrommenu=function()
{
// must always return trunk tracks
var bbj=this.trunk?this.trunk:this;
var lst2=menu.c53.checkbox.checked?bbj.tklst:gflag.menu.tklst;
var lst=[];
for(var i=0; i<lst2.length; i++) {
	var t=bbj.findTrack(lst2[i].name, lst2[i].cotton);
	if(!t) continue;
	if(!tkishidden(t)) {
		lst.push(t);
	}
}
return lst;
}

/*** __qtc__ ends ***/



function stc_fontfamily() { menu_update_track(12); }
function stc_fontsize(event)
{
menu.font.sizeincrease=event.target.increase;
menu_update_track(14);
}
function stc_fontbold() { menu_update_track(13); }
function stc_longrange_pcolorscore_KU(event) { if(event.keyCode==13) stc_longrange_pcolorscore(); }
function stc_longrange_pfilterscore_KU(event) { if(event.keyCode==13) stc_longrange_pfilterscore(); }
function stc_longrange_ncolorscore_KU(event) { if(event.keyCode==13) stc_longrange_ncolorscore(); }
function stc_longrange_nfilterscore_KU(event) { if(event.keyCode==13) stc_longrange_nfilterscore(); }



/*** __palette__ ***
a pair of two functions, 
- xx_initiator()
 toggles on palette, register xx() for click event
- xx()
 capture color and do stuff, hide palette, remove event registry
 */
function paletteMover() {
document.body.removeEventListener('mousedown', palettehide, false)
document.body.removeEventListener('mousedown', menu_hide,false);
}
function paletteMout() {
document.body.addEventListener('mousedown', palettehide, false)
document.body.addEventListener('mousedown', menu_hide,false);
}
function palette_context_update() {
switch(palette.which) {
case 1: stc_textcolor();return;
case 2: stc_bedcolor(); return;
case 3: stc_forwardcolor();return;
case 4: stc_reversecolor();return;
case 5: stc_mismatchcolor();return;
case 6: stc_longrange_pcolor();return;
case 8: stc_longrange_ncolor();return;
case 10: hengeview_arcpcolor();return;
case 11: hengeview_arcncolor();return;
case 12: mcm_configcolor();return;
case 13: scatterplot_dotcolor();return;
case 14: matplot_linecolor();return;
case 15: tk_bgcolor();return;
case 16: cmtk_color_set();return;
case 17: ldtk_color_set();return;
case 20: document.getElementById('geneplot_s4_pc').style.backgroundColor = palette.output; return;
case 21: document.getElementById('geneplot_s4_nc').style.backgroundColor = palette.output; return;
case 22: document.getElementById('geneplot_s1_lc').style.backgroundColor = palette.output; return;
case 23: document.getElementById('geneplot_s2_lc').style.backgroundColor = palette.output; return;
case 24: document.getElementById('geneplot_s3_promoterc').style.backgroundColor = palette.output; return;
case 25: document.getElementById('geneplot_s3_utr5c').style.backgroundColor = palette.output; return;
case 26: document.getElementById('geneplot_s3_utr3c').style.backgroundColor = palette.output; return;
case 27: document.getElementById('geneplot_s3_exonsc').style.backgroundColor = palette.output; return;
case 28: document.getElementById('geneplot_s3_intronsc').style.backgroundColor = palette.output; return;
case 30: 
	menu.c50.color1.style.backgroundColor=palette.output;
	menu_update_track(1);
	return;
case 31:
	menu.c50.color2.style.backgroundColor=palette.output;
	menu_update_track(2);
	return;
case 32:
	menu.c50.color1_1.style.backgroundColor=palette.output;
	menu_update_track(3);
	return;
case 33:
	menu.c50.color2_1.style.backgroundColor=palette.output;
	menu_update_track(4);
	return;
case 39: custcate_submitui_setcolor();return;
case 40: hengeview_wreathpcolor();return;
case 41: hengeview_wreathncolor();return;
case 42: cateTkitemcolor();return;
case 43: tk_barplotbg();return;
default:
fatalError("palette_context_update: unknown palette.which");
}
}
function palettehide() {
    palette.style.display = "none";
    document.body.removeEventListener("mousedown", palettehide, false);
}
function paletteshow(x,y, which)
{
// x and y should be event.clientX/Y
// TODO automatic beak placement, ...
palette.style.display = "block";
var w=200;
if(x+w>document.body.clientWidth) {
	x=document.body.clientWidth-w;
} else {
	x-=80;
}
var h=250;
if(y+h>document.body.clientHeight) {
	y=document.body.clientHeight-h-40;
} else {
	y+=5;
}
palette.style.left = x;
palette.style.top = y;
palette.which=which;
document.body.addEventListener('mousedown', palettehide,false);
}
function palettedyeclick(event)
{
    // clicking palette dye
    palettegrove_paint(event.target.style.backgroundColor);
    palette.output = event.target.style.backgroundColor;
    palette_context_update();
}
function palettegrove_paint(color) {
    palette.grove.color = color;
    var ctx = palette.grove.getContext('2d');
    var lingrad = ctx.createLinearGradient(0,0,100,0);
    lingrad.addColorStop(0,'black');
    lingrad.addColorStop(0.5, color);
    lingrad.addColorStop(1, 'white');
    ctx.fillStyle = lingrad;
    ctx.fillRect(0,0,100,20);
}
function palettesliderMD(event) {
    // palette slider md
    event.preventDefault();
    palette.slider.x = event.clientX;
    document.body.addEventListener("mousemove", palettesliderM, false);
    document.body.addEventListener("mouseup", palettesliderMU, false);
}
function palettesliderM(event) {
    var x = event.clientX;
    var oldx = palette.slider.x;
    var l = parseInt(palette.slider.style.left);
    if((x>oldx && l>=100) || (x<oldx && l<=0))
        return;
    palette.slider.style.left = l + x-oldx;
    l = parseInt(palette.slider.style.left);
    if(l > 100)
	palette.slider.style.left = 100;
    else if(l<0)
	palette.slider.style.left = 0;
    palette.slider.x = event.clientX;
}
function palettesliderMU() {
    document.body.removeEventListener("mousemove", palettesliderM, false);
    document.body.removeEventListener("mouseup", palettesliderMU, false);
    var x = parseInt(palette.slider.style.left);
    if(x == 50)
        palette.output = palette.grove.color;
    else if(x < 50)
        palette.output = darkencolor(colorstr2int(palette.grove.color), (100-x*2)/100);
    else
        palette.output = lightencolor(colorstr2int(palette.grove.color), (x-50)/50);
    palette_context_update();
}
function palettegrove_click(event) {
    // clicking on palette grove to pick up a color from the gradient
    var pos = absolutePosition(palette.grove);
    palette.slider.style.left = event.clientX - pos[0];
    var x = parseInt(palette.slider.style.left);
    if(x == 50)
        palette.output = palette.grove.color;
    else if(x < 50)
        palette.output = darkencolor(colorstr2int(palette.grove.color), (100-x*2)/100);
    else
        palette.output = lightencolor(colorstr2int(palette.grove.color), (x-50)/50);
    palette_context_update();
}


function tk_bgcolor_initiator(event)
{
paletteshow(event.clientX, event.clientY, 15);
palettegrove_paint(menu.c44.color.style.backgroundColor);
}
function tk_bgcolor()
{
menu.c44.color.style.backgroundColor=palette.output;
menu_update_track(33);
}

function tk_barplotbg_initiator(event)
{
paletteshow(event.clientX, event.clientY, 43);
palettegrove_paint(menu.c44.color.style.backgroundColor);
}
function tk_barplotbg()
{
menu.c29.color.style.backgroundColor=palette.output;
menu_update_track(36);
}

function cmtk_color_initiate(event)
{
paletteshow(event.clientX, event.clientY, 16);
palettegrove_paint(event.target.style.backgroundColor);
gflag.menu.cmtk_colorcell=event.target;
}
function cmtk_color_set()
{
gflag.menu.cmtk_colorcell.style.backgroundColor=palette.output;
menu_update_track(27);
}


function stc_textcolor_initiator(event)
{
paletteshow(event.clientX, event.clientY, 1);
palettegrove_paint(event.target.style.backgroundColor);
}
function stc_textcolor()
{
menu.font.color.style.backgroundColor=palette.output;
menu_update_track(11);
}
function stc_bedcolor_initiator(event)
{
paletteshow(event.clientX, event.clientY, 2);
palettegrove_paint(event.target.style.backgroundColor);
}
function stc_bedcolor(event)
{
menu.bed.color.style.backgroundColor=palette.output;
menu_update_track(10);
}
function stc_forwardcolor_initiator(event)
{
paletteshow(event.clientX, event.clientY, 3);
palettegrove_paint(event.target.style.backgroundColor);
}
function stc_forwardcolor()
{
menu.bam.f.style.backgroundColor=palette.output;
menu_update_track(15);
}
function stc_reversecolor_initiator(event)
{
paletteshow(event.clientX, event.clientY, 4);
palettegrove_paint(event.target.style.backgroundColor);
}
function stc_reversecolor()
{
menu.bam.r.style.backgroundColor=palette.output;
menu_update_track(16);
}
function stc_mismatchcolor_initiator(event)
{
paletteshow(event.clientX, event.clientY, 5);
palettegrove_paint(event.target.style.backgroundColor);
}
function stc_mismatchcolor()
{
menu.bam.m.style.backgroundColor=palette.output;
menu_update_track(17);
}
function stc_longrange_pcolor_initiator(event)
{
paletteshow(event.clientX, event.clientY, 6);
//gflag.menu.context==1?6:10);
palettegrove_paint(event.target.style.backgroundColor);
}
function stc_longrange_pcolor(event)
{
longrange_showplotcolor(palette.output);
menu_update_track(19);
}
function stc_longrange_ncolor_initiator(event)
{
paletteshow(event.clientX, event.clientY, 8);
//gflag.menu.context==1?8:11);
palettegrove_paint(event.target.style.backgroundColor);
}
function stc_longrange_ncolor(event)
{
longrange_showplotcolor(null,palette.output);
menu_update_track(20);
}

function hengeview_arcpcolor_initiator(event) {
	paletteshow(event.clientX, event.clientY, 10);
	palettegrove_paint(event.target.style.backgroundColor);
}
function hengeview_arcpcolor()
{
var c=colorstr2int(palette.output);
apps.circlet.hash[gflag.menu.viewkey].callingtk.pcolor=c.join(',');
hengeview_draw(gflag.menu.viewkey);
longrange_showplotcolor(palette.output,null);
}
function hengeview_arcncolor_initiator(event) {
	paletteshow(event.clientX, event.clientY, 11);
	palettegrove_paint(event.target.style.backgroundColor);
}
function hengeview_arcncolor() {
	var c=colorstr2int(palette.output);
	apps.circlet.hash[gflag.menu.viewkey].callingtk.ncolor=c.join(',');
	hengeview_draw(gflag.menu.viewkey);
	longrange_showplotcolor(null,palette.output);
}
function hengeview_wreathpcolor_initiator(event) {
	paletteshow(event.clientX, event.clientY, 40);
	palettegrove_paint(event.target.style.backgroundColor);
	palette.hook=event.target; // contains track name
}
function hengeview_wreathpcolor() {
	palette.hook.style.backgroundColor=palette.output;
	var c=colorstr2int(palette.output);
	var tkn=palette.hook.parentNode.parentNode.tkname;
	var lst=apps.circlet.hash[gflag.menu.viewkey].wreath;
	for(var i=0; i<lst.length; i++) {
		if(lst[i].name==tkn) {
			lst[i].qtc.pr=c[0];
			lst[i].qtc.pg=c[1];
			lst[i].qtc.pb=c[2];
			break;
		}
	}
	hengeview_draw(gflag.menu.viewkey);
}
function hengeview_wreathncolor_initiator(event) {
	paletteshow(event.clientX, event.clientY, 41);
	palettegrove_paint(event.target.style.backgroundColor);
	palette.hook=event.target; // contains track name
}
function hengeview_wreathncolor() {
	palette.hook.style.backgroundColor=palette.output;
	var c=colorstr2int(palette.output);
	var tkn=palette.hook.parentNode.parentNode.tkname;
	var lst=apps.circlet.hash[gflag.menu.viewkey].wreath;
	for(var i=0; i<lst.length; i++) {
		if(lst[i].name==tkn) {
			lst[i].qtc.nr=c[0];
			lst[i].qtc.ng=c[1];
			lst[i].qtc.nb=c[2];
			break;
		}
	}
	hengeview_draw(gflag.menu.viewkey);
}

function stc_longrange_autoscale(event)
{
// toggling checkbox
menu.lr.pcscore.parentNode.style.display=menu.lr.ncscore.parentNode.style.display=event.target.checked?'none':'inline';
menu.lr.pcscoresays.style.display=menu.lr.ncscoresays.style.display=event.target.checked?'inline':'none';
menu_update_track(18);
}

function stc_longrange_pcolorscore()
{
/* apply positive score cutoff for coloring
TODO hammock generic
*/
var score=parseFloat(menu.lr.pcscore.value);
if(isNaN(score)) {
	print2console('Invalid input for positive score cutoff', 2);
	return;
}
if(score < 0) {
	print2console('score cutoff must be positive',2);
	return;
}
menu_update_track(21);
}
function stc_longrange_ncolorscore()
{
/* apply negative score cutoff for coloring
TODO hammock
*/
var score = parseFloat(menu.lr.ncscore.value);
if(isNaN(score)) {
	print2console('Invalid input for negative score cutoff', 2);
	return;
}
if(score > 0) {
	print2console('score cutoff must be negative',2);
	return;
}
menu_update_track(22);
}

function stc_longrange_pfilterscore()
{
/* apply positive score cutoff for filtering
TODO hammock
*/
var score = parseFloat(menu.lr.pfscore.value);
if(isNaN(score)) {
	print2console('Invalid input for positive score cutoff', 2);
	return;
}
if(score < 0) {
	print2console('score cutoff must be positive',2);
	return;
}
menu_update_track(23);
}
function stc_longrange_nfilterscore()
{
/* apply negative score cutoff for filtering
TODO hammock
*/
var score = parseFloat(menu.lr.nfscore.value);
if(isNaN(score)) {
	print2console('Invalid input for negative score cutoff', 2);
	return;
}
if(score > 0) {
	print2console('score cutoff must be negative',2);
	return;
}
menu_update_track(24);
}

/*** __palette__ ends ***/


function bubbleShow(x,y)
{
bubble.style.display = "block";
bubble.style.left = x-13;
bubble.style.top = y;
document.body.addEventListener("mousedown", bubbleHide, false);
bubble.sayajax.style.display='none';
setTimeout('bubble.says.style.maxHeight="800px";',1);
}
function bubbleHide()
{
bubble.style.display='none';
document.body.removeEventListener('mousedown', bubbleHide, false);
setTimeout('bubble.says.style.maxHeight=0;bubble.sayajax.style.maxHeight=0;',1);
// must not directly set maxHeight to 0 in case of clicking on blank track region
}
function bubbleMover() {document.body.removeEventListener('mousedown', bubbleHide, false);};
function bubbleMout() {document.body.addEventListener('mousedown', bubbleHide, false);};

Browser.prototype.lditemclick_gotdata=function(data,tkobj,rs1,rs2)
{
if(!data || !data.tkdatalst || data.tkdatalst.length==0) {
	bubble.sayajax.innerHTML='Error fetching data, sorry...';
	return;
}
var t=data.tkdatalst[0].data;
if(!t || t.length!=2) {
	bubble.sayajax.innerHTML='no data...';
	return;
}
stripChild(bubble.sayajax,0);
var table3=dom_create('table',bubble.sayajax,'color:white');
var tr3=table3.insertRow(0);
var td1=tr3.insertCell(0);
td1.style.paddingRight=20;
var miss=true;
for(var i=0; i<t[0].length; i++) {
	var item=t[0][i];
	if(item.name==rs1) {
		var table=dom_create('table',td1,'color:white');
		var td=table.insertRow(0).insertCell(0);
		td.colSpan=2;
		if(tkobj.queryUrl) {
			td.innerHTML='<a href='+tkobj.queryUrl+rs1+' style="color:white" target=_blank>'+rs1+'</a>';
		} else {
			td.innerHTML=rs1;
		}
		if(item.category!=undefined && tkobj.cateInfo) {
			td=table.insertRow(-1).insertCell(0);
			td.colSpan=2;
			var c=tkobj.cateInfo[item.category];
			td.innerHTML='<span class=squarecell style="padding:0px 8px;background-color:'+c[1]+';">&nbsp;</span> '+c[0];
		}
		if(item.details) {
			for(var k in item.details) {
				var tr=table.insertRow(-1);
				td=tr.insertCell(0);
				td.style.fontStyle='italic';
				td.style.opacity=0.8;
				td.innerHTML=k;
				td=tr.insertCell(1);
				td.innerHTML=item.details[k];
			}
		}
		miss=false;
		break;
	}
}
if(miss) {
	td1.innerHTML=
		(tkobj.queryUrl ? '<a href='+tkobj.queryUrl+rs1+' style="color:white" target=_blank>'+rs1+'</a>' : rs1)+
		'<br>No data';
}
// duplication 
var td2=tr3.insertCell(1);
miss=true;
for(var i=0; i<t[1].length; i++) {
	var item=t[1][i];
	if(item.name==rs2) {
		var table=dom_create('table',td2,'color:white');
		var td=table.insertRow(0).insertCell(0);
		td.colSpan=2;
		if(tkobj.queryUrl) {
			td.innerHTML='<a href='+tkobj.queryUrl+rs2+'  style="color:white" target=_blank>'+rs2+'</a>';
		} else {
			td.innerHTML=rs2;
		}
		if(item.category!=undefined && tkobj.cateInfo) {
			td=table.insertRow(-1).insertCell(0);
			td.colSpan=2;
			var c=tkobj.cateInfo[item.category];
			td.innerHTML='<span class=squarecell style="padding:0px 8px;background-color:'+c[1]+';">&nbsp;</span> '+c[0];
		}
		if(item.details) {
			for(var k in item.details) {
				var tr=table.insertRow(-1);
				td=tr.insertCell(0);
				td.style.fontStyle='italic';
				td.style.opacity=0.8;
				td.innerHTML=k;
				td=tr.insertCell(1);
				td.innerHTML=item.details[k];
			}
		}
		miss=false;
	}
}
if(miss) {
	td2.innerHTML=
		(tkobj.queryUrl ? '<a href='+tkobj.queryUrl+rs2+' style="color:white" target=_blank>'+rs2+'</a>' : rs2)+
		'<br>No data';
}
bubble.sayajax.style.maxHeight=1000;
}

function sort_struct(a,b)
{
return a[0]-b[0];
}

function samread_seqregion(cigar,coord)
{
var lst=[];
for(var i=0; i<cigar.length; i++) {
	var op=cigar[i][0];
	var cl=cigar[i][1];
	if(op=='M') {
		lst.push([coord,coord+cl]);
	}
	coord+=cl;
}
return lst;
}

Browser.prototype.trackitem_delete=function(tk,item,itemRidx)
{
for(var i=0; i<tk.data[itemRidx].length; i++) {
	if(tk.data[itemRidx][i].id==item.id) {
		tk.data[itemRidx].splice(i,1);
		var oldheight=tk.canvas.height;
		this.stack_track(tk,0);
		this.drawTrack_browser(tk);
		if(tk.canvas.height!=oldheight) {
			this.trackHeightChanged();
		}
		bubbleHide();
		return;
	}
}
print2console('Can\'t find this item!?',2);
}

Browser.prototype.track2packmode=function(tk)
{
var data2=[];
for(var i=0; i<tk.data.length; i++) {
	var lst2=[];
	for(var j=0; j<tk.data[i].length; j++) {
		var item=tk.data[i][j];
		var ni=item.name2?item.name2:item.name;
		var keep=true;
		for(var k=0; k<lst2.length; k++) {
			var a=lst2[k].start,
				b=lst2[k].stop,
				nk=lst2[k].name2?lst2[k].name2:lst2[k].name;
			if(a<=item.start && b>=item.stop && nk==ni) {
				// do nothing
				keep=false;
				break;
			} else if(a>=item.start && b<=item.stop) {
				lst2.splice(k,1,item);
				keep=false;
				break;
			} else if(Math.max(a,item.start)<Math.min(b,item.stop)){
				// try name
				if(nk==ni) {
					if(b-a < item.stop-item.start) {
						lst2.splice(k,1,item);
					}
					keep=false;
					break;
				}
			}
		}
		if(keep) {
			lst2.push(item);
		}
	}
	data2.push(lst2);
}
tk.data=data2;
var oldheight=tk.canvas.height;
this.stack_track(tk,0);
this.drawTrack_browser(tk);
if(tk.canvas.height!=oldheight) {
	this.trackHeightChanged();
}
}


Browser.prototype.bamread2bubble=function(data,item)
{
if(!data || !data.lst) {
	print2console('Server error, please try again!',2);
	return;
}
stripChild(bubble.sayajax,0);
var table=dom_create('table',bubble.sayajax);
table.style.color='white';
if(item.hasmate) {
	// paired-end
	var r1=item.struct.L;
	var r2=item.struct.R;
	var coord_l=samread_seqregion(r1.bam.cigar,r1.start),
		coord_r=samread_seqregion(r2.bam.cigar,r2.start);
	if(data.lst.length!=coord_l.length+coord_r.length) {
		print2console('Sequence data error',2);
		return;
	}
	var tr=table.insertRow(0);
	var td=tr.insertCell(0);
	td.colSpan=2;
	td.style.borderTop='solid 1px rgba(255,255,255,0.1)';
	td.style.color='white';
	dom_addtext(td,'[ left end ]');
	printSamread(table,r1.bam,data.lst.splice(0,coord_l.length).join(''));
	tr=table.insertRow(-1);
	td=tr.insertCell(0);
	td.colSpan=2;
	td.style.borderTop='solid 1px rgba(255,255,255,0.1)';
	td.style.color='white';
	dom_addtext(td,'[ right end ]');
	printSamread(table,r2.bam,data.lst.join(''));
} else {
	var c=samread_seqregion(item.bam.cigar,item.start);
	printSamread(table,item.bam,data.lst.join(''));
}
bubble.sayajax.style.maxHeight=1000;
}

function printSamread(table,info,refseq)
{
var tr=table.insertRow(-1);
var td=tr.insertCell(0);
td.colSpan=2;
var alignlen=0; // aligned length
if(info.cigar) {
	for(var i=0; i<info.cigar.length; i++) {
		var c=info.cigar[i];
		if(c[0]=='M') alignlen+=c[1];
	}
}
td.innerHTML=((((info.flag>>4)&1)==1)?'Reverse':'Forward')+', '+
	(alignlen==info.seq.length?alignlen+' bp':'read length: '+info.seq.length+' bp, '+alignlen+' bp aligned');
if(info.cigar) {
	tr=table.insertRow(-1);
	td=tr.insertCell(0);
	td.style.opacity=.5;
	td.innerHTML='cigar';
	td=tr.insertCell(1);
	td.innerHTML=cigar2str(info.cigar);
}
tr=table.insertRow(-1);
td=tr.insertCell(0);
td.style.opacity=.5;
td.innerHTML='aln. start';
td=tr.insertCell(1);
td.innerHTML=info.start;
tr=table.insertRow(-1);
td=tr.insertCell(0);
td.style.opacity=.5;
td.innerHTML='aln. stop';
td=tr.insertCell(1);
td.innerHTML=info.stop;

tr=table.insertRow(-1);
td=tr.insertCell(0);
td.style.opacity=.5;
td.innerHTML='reference';
var std=tr.insertCell(1);
std.style.font='15px Courier,monospace';
tr=table.insertRow(-1);
td=tr.insertCell(0);
td.style.opacity=.5;
td.innerHTML='read';
td.style.paddingBottom=10;
var rtd=tr.insertCell(1);
rtd.style.font='15px Courier,monospace';
rtd.style.paddingBottom=10;
var readseq=info.seq; // make copy
// insertion/deletion
if(info.cigar.length>0) {
	var i=0;
	for(var j=0; j<info.cigar.length; j++) {
		var op=info.cigar[j][0];
		var cl=info.cigar[j][1];
		if(op=='I') {
			var tmp=[refseq.substr(0,i)];
			for(var k=0; k<cl; k++) tmp.push('*');
			refseq=tmp.join('')+refseq.substr(i);
		} else if(op=='D') {
			var tmp=[readseq.substr(0,i)];
			for(var k=0; k<cl; k++) tmp.push('*');
			readseq=tmp.join('')+readseq.substr(i);
		}
		i+=cl;
	}
}
var readbp=[];
for(var i=0; i<readseq.length; i++) {
	var a=null;
	if(i<refseq.length) a=refseq[i];
	var b=readseq[i];
	var rbp=dom_addtext(rtd,b);
	readbp.push(rbp);
	if(a) {
		dom_addtext(std,a);
		if(b!='*' && a!='*') {
			if(a.toLowerCase()!=b.toLowerCase()) {
				rbp.style.backgroundColor='rgba(255,255,0,0.4)';
			}
		}
	}
}
// clippings
if(info.cigar.length>0) {
	var c=info.cigar[0];
	if(c[0]=='S') {
		for(i=0; i<c[1]; i++) {
			readbp[i].style.backgroundColor=colorCentral.background_faint_3;
		}
	}
	c=info.cigar[info.cigar.length-1];
	if(c[0]=='S') {
		for(i=0; i<c[1]; i++) {
			readbp[readbp.length-1-i].style.backgroundColor=colorCentral.background_faint_3;
		}
	}
}
}

function cigar2str(c)
{
var s=[];
for(var i=0; i<c.length; i++) {
	s.push(c[i][1]);
	s.push(c[i][0]);
}
return s.join('');
}



function dye_seq(seq)
{
// soaked in an urn
var lst=[];
for(var i=0; i<seq.length; i++) {
	var c=seq.charAt(i);
	lst.push('<span style="background-color:'+ntbcolor[c.toLowerCase()]+'">'+c+'</span>');
}
return lst.join('');
}


function findDecoritem_longrange_trihm(data, angle, mX, mY)
{
/* args:
data - .data_trihm
angle - .qtc.angle
mX/mY - cursor position relative to start of canvas

ascending lines:
A : tan
B : -1
C : b-a*tan
C2: b-a*tan-m*tan

descending lines:
A : -tan
B : -1
C : a*tan+b
C2: a*tan+b-n*tan

use formular to calculate point-to-line distance
*/
var tan=Math.tan(angle);
var sin=Math.sin(angle);
for(var i=0; i<data.length; i++) {
	var item = data[i];
	var a=item[0];
	var b=item[1];
	var m=item[2];
	var n=item[3];
	// distance to first ascending line
	if(Math.abs(tan*mX-mY+b-a*tan) > m*sin*Math.sqrt(tan*tan+1)) continue;
	// distance to second ascending line
	if(Math.abs(tan*mX-mY+b-a*tan-m*tan) > m*sin*Math.sqrt(tan*tan+1)) continue;
	// distance to first descending line
	if(Math.abs(-tan*mX-mY+a*tan+b) > n*sin*Math.sqrt(tan*tan+1)) continue;
	// distance to second descending line
	if(Math.abs(-tan*mX-mY+a*tan+b-n*tan) > n*sin*Math.sqrt(tan*tan+1)) continue;
	return item;
}
return null;
}
function findDecoritem_longrange_arc(data, x,y)
{
/* data: .data_arc
x/y: absolute postion on tk canvas
*/
for(var i=0; i<data.length; i++) {
	var t=data[i];
	if(Math.abs(Math.sqrt(Math.pow(x-t[0],2)+Math.pow(y-t[1],2))-t[2])<=2) {
		return t;
	}
}
return null;
}






/*** __dsp__ ***/

Browser.prototype.displayedRegionParam=function()
{
/* only viewbox region
optional arg: start coord of first region, stop coord of last region to cope with zoom in
 */
var t=this.getDspStat();
var jt=this.juxtaposition.type;
var param='&runmode='+jt;
if(this.is_gsv()) {
	// TODO remove itemlist parameter
	param += '&itemlist=on&startChr='+t[0]+'&stopChr='+t[2];
} else {
	param += '&juxtaposeTk='+this.juxtaposition.what+'&startChr='+t[0]+'&stopChr='+t[2];
}
if(arguments[0]!=undefined && arguments[1]!=undefined) {
	return param + "&startCoord=" + arguments[0] + "&stopCoord=" + arguments[1];
} else {
	return param + "&startCoord="+ t[1]+ "&stopCoord="+t[3];
}
}

Browser.prototype.displayedRegionParamMove=function()
{
var r1=this.regionLst[0];
var r2=this.regionLst[this.regionLst.length-1];
var jt = this.juxtaposition.type;
if(this.is_gsv()) {
	return "itemlist=on&startChr="+r1[6]+
		"&startCoord="+r1[3]+
		"&stopChr="+r2[6]+
		"&stopCoord="+r2[4]+
		"&sptotalnum="+(this.entire.spnum-this.regionLst.length+1);
}
return 'runmode='+jt+'&juxtaposeTk='+this.juxtaposition.what+
"&startChr=" + r1[0] +
"&startCoord=" + r1[3] +
"&stopChr=" + r2[0] +
"&stopCoord=" + r2[4] +
"&sptotalnum="+ (this.entire.spnum-this.regionLst.length+1);
}



Browser.prototype.displayedRegionParamPrecise=function()
{
/* use in operations that doesn't change dsp
- add tracks
- htest
- ajax correlation
- get data
 */
var jt = this.juxtaposition.type;
if(this.is_gsv()) {
	// only need to pass spnum of each item, but no need to pass item name, start/stop
	// as that's already in database
	var sizelst = []; // spnum in each item
	for(var i=0; i<this.regionLst.length; i++) {
		sizelst.push(this.regionLst[i][5]);
	}
	var lastr = this.regionLst[this.regionLst.length - 1];
	return "itemlist=on&startChr="+this.regionLst[0][6]+
		"&startCoord="+this.regionLst[0][3]+
		"&stopChr="+lastr[6]+
		"&stopCoord="+lastr[4]+
		"&sptotalnum="+ (this.entire.atbplevel?this.entire.length:(this.entire.spnum-i)) +
		"&allrss=" + sizelst.join(',');
}
// by passing exact information on each region in collation mode (chr, start/stop, spnum)
// it saves a lot of computing on server side, so it's necessary
var lst = [];
for(var i=0; i<this.regionLst.length; i++) {
	var r = this.regionLst[i];
	lst.push(r[0]+','+r[1]+','+r[2]+','+(this.entire.atbplevel ? (r[4]-r[3]) : r[5]));
}
return this.runmode_param()+
   "&regionLst=" + lst.join(',') +
   "&startCoord=" + this.regionLst[0][3] +
   "&stopCoord=" + this.regionLst[this.regionLst.length-1][4];
}

Browser.prototype.displayedRegionParam_narrow=function()
{
/* for re-doing lr data from view range, for circlet view
TODO check if it's alright
*/
var lst=[];
for(var i=this.dspBoundary.vstartr;i<=this.dspBoundary.vstopr;i++) {
	var r=this.regionLst[i];
	lst.push(r[0]);
	lst.push(r[3]);
	lst.push(r[4]);
	lst.push(10); // fictional spnum
}
var t=this.getDspStat();
return '&runmode='+this.genome.defaultStuff.runmode+'&regionLst='+lst.join(',')+
	'&startCoord='+t[1]+
	'&stopCoord='+t[3];
}


Browser.prototype.getDspStat=function()
{
// return array for saving status, see dbSchema.dia
var startr = this.regionLst[this.dspBoundary.vstartr];
var stopr = this.regionLst[this.dspBoundary.vstopr];
if(this.is_gsv()) return [startr[6], this.dspBoundary.vstartc, stopr[6], this.dspBoundary.vstopc];
return [startr[0], this.dspBoundary.vstartc, stopr[0], this.dspBoundary.vstopc];
}



Browser.prototype.atLeftBorder=function()
{
// see if leftmost point in regionLst is at left border
var b=this.border;
var r=this.regionLst[0];
if(this.is_gsv()) return (r[6]==b.lname) && (r[3]<=b.lpos);
return (r[0]==b.lname) && (r[3]<=b.lpos);
}

Browser.prototype.atRightBorder=function()
{
// see if rightmost point in regionLst is at right border
var b=this.border;
var r = this.regionLst[this.regionLst.length-1];
if(this.is_gsv()) return (r[6]==b.rname) && (r[4]>=b.rpos);
return (r[0]==b.rname) && (r[4]>=b.rpos);
}

Browser.prototype.jsonDsp=function(data)
{
if(!data.regionLst) {
	if(this.weaver && this.weaver.iscotton) {
		/* a query genome bbj has its regionLst already made
		is not asking for regionLst from cgi
		*/
		return;
	}
	fatalError('jsonDsp: regionLst missing');
}
/* update lots of stuff related with dsp:
- border
- move
- entire
- regionLst
- dspBoundary
*/
if(data.border) {
	this.border={
		lname:data.border[0],
		lpos:data.border[1],
		rname:data.border[2],
		rpos:data.border[3]
		};
	if(this.genome.temporal_ymd) {
		this.border.lpos=101;
	}
}

var in_gsv = this.is_gsv();

this.entire.atbplevel = ('atbplevel' in data);
if(!this.move.direction) {
	/** not panning, set regionLst anew **/
	this.regionLst = data.regionLst;
	if(this.entire.atbplevel) {
		/* atbplevel is solely decided by cgi
		entering bplevel must be in non-moving condition (moving cannot result in atbplevel)
		compute .bpwidth
		*/
		var totallen=0;
		for(var i=0; i<this.regionLst.length; i++) {
			totallen+=(this.regionLst[i][4]-this.regionLst[i][3]);
		}
		/* fixed an ooold bug here */
		if(totallen>=this.hmSpan*3) {
			print2console('atbplevel but totallen>hmSpan*3',2);
			totallen=this.hmSpan*3;
		}
		var a=this.hmSpan*3/totallen;
		var b=parseInt(a);
		this.entire.bpwidth=b+((a-b)>=.5?1:0);
		
		/* atbplevel special update:
		regionLst[i][5] to be region plotting width
		entire.spnum to be plotting width of everything...
		r[7] doesn't matter
		*/
		for(i=0; i<this.regionLst.length; i++) {
			var r=this.regionLst[i];
			r[5] = this.entire.bpwidth * (r[4]-r[3]);
		}
	} else {
		for(var i=0; i<this.regionLst.length; i++) {
			var r=this.regionLst[i];
			// r[5] is given as spnum
			r[7]=(r[4]-r[3])/r[5];
		}
	}
	this.updateEntire();
	// compute .styleLeft for all movable components
	if(!('viewStart' in data)) {
		print2console(data.regionLst,0);
		fatalError("jsonDsp: viewStart missing when not moving");
	}
	var ridx=data.viewStart[0],
		coord=data.viewStart[1];
	var x=this.cumoffset(ridx,coord);
	if(x==-1) fatalError('viewStart out of range: '+ridx+' '+coord);
	this.move.styleLeft=parseInt(-x);
	this.updateDspBoundary();
	this.scalebarSlider_fill();
	this.drawNavigator();
	return;
}

/* panning
beware: atbplevel, region data passed from CGI have # of bp as [5], need to multiply by entire.bpwidth
entire.bpwidth must have already been determined as above, and won't change during moving
*/
for(var i=0; i<data.regionLst.length; i++) {
	var r=data.regionLst[i];
	if(this.entire.atbplevel) {
		r[5] *= this.entire.bpwidth;
	} else {
		r[7]=(r[4]-r[3])/r[5];
	}
}

// determine whether to merge regions
this.move.merge = false;
if(in_gsv) {
	if(this.move.direction == 'l') {
		var n = data.regionLst[data.regionLst.length-1]; // new
		var o = this.regionLst[0]; // old
		if(n[6] == o[6]) {
			this.move.merge = true;
			this.move.offsetShift = n[5];
		}
	} else {
		var n = data.regionLst[0]; // new
		var o = this.regionLst[this.regionLst.length-1]; // old
		if(n[6] == o[6]) {
			this.move.merge = true;
			this.move.offsetShift = o[5];
		}
	}
} else {
	if(this.move.direction == 'l') {
		var n = data.regionLst[data.regionLst.length-1]; // new
		var o = this.regionLst[0]; // old
		// only look at chr name and region bstart!
		if(n[0]==o[0] && n[1]==o[1]) {
			this.move.merge = true;
			// set move.offsetShift for shifting old bed items
			this.move.offsetShift = n[5];
		}
	} else {
		var n = data.regionLst[0]; // new
		var o = this.regionLst[this.regionLst.length-1]; // old
		// only look at chr name and region bstop!
		if(n[0]==o[0] && n[2]==o[2]) {
			this.move.merge = true;
			// set move.offsetShift for shifting new bed items
			this.move.offsetShift = o[5];
		}
	}
}
/* special attention --
move.styleLeft has been set to a new value during move,
where .style.left of all movable components were set to it.
If expose on right, .styleLeft won't need to be changed,
but if on left, it has to be changed to accommondate new data.

1. find current view region start by setting
dspBoundary.vstartr .vstarts using old regionLst
2. update regionLst
if .vstartr==0, and move to left, and merge: need to shift .vstartr .vstarts
3. build dspBoundary
*/
// update regionLst
var newlst = data.regionLst;
if(this.move.direction == 'l') {
	if(this.move.merge) {
		var lastr = newlst[newlst.length-1];
		this.regionLst[0][3] = lastr[3]; // dstart
		this.regionLst[0][5] += lastr[5]; // # summary points
		this.move.styleLeft-=lastr[5];
		newlst.pop();
	}
	for(var i=0; i<newlst.length; i++) {
		this.move.styleLeft-=newlst[i][5]-regionSpacing.width;
	}
	this.regionLst = newlst.concat(this.regionLst);
	if(this.weaver) {
		for(var i=0; i<newlst.length; i++) {
			this.weaver.insert.unshift([]);
		}
	}
} else {
	if(this.move.merge) {
		var firstr = newlst[0];
		var lastr = this.regionLst[this.regionLst.length-1];
		lastr[4] = firstr[4]; // dstop
		lastr[5] += firstr[5]; // # summary points
		newlst.shift();
	}
	this.regionLst = this.regionLst.concat(newlst);
	if(this.weaver) {
		for(var i=0; i<newlst.length; i++) {
			this.weaver.insert.push([]);
		}
	}
}
this.move.styleLeft=parseInt(this.move.styleLeft);
this.updateEntire();
this.updateDspBoundary();
this.scalebarSlider_fill();
this.drawNavigator();
}



Browser.prototype.updateDspBoundary=function()
{
/* call after zoom level might have been changed
updates .dspBoundary and .entire
requires:
move.styleLeft 
regionLst, where [5] region plot width must be ready
*/
var d=this.dspBoundary;
var t = this.sx2rcoord(-this.move.styleLeft);
// must not fail!
if(!t) fatalError('null vstart for '+this.horcrux);
d.vstartr = t.rid;
d.vstarts = t.sid;
d.vstartc=parseInt(t.coord);
t=this.sx2rcoord(this.hmSpan-this.move.styleLeft);
if(!t) {
	d.vstopr=this.regionLst.length-1;
	var r=this.regionLst[d.vstopr];
	d.vstops=r[5];
	d.vstopc=r[4];
} else {
	d.vstopr = t.rid;
	d.vstops = t.sid;
	d.vstopc=parseInt(t.coord);
}
this.updateDspstat();
}


Browser.prototype.updateEntire=function()
{
/* only called in jsonDsp
entire.atbplevel must be determined
!! only updates entire, do not meddle with region attributes !!
r[5] and r[7] is not to be affected by weaver.insert
r[5] is determined by cgi
r[7] is calculated when new region is added
*/
this.entire.length = 0;
var actualsp=0;
for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	this.entire.length += r[4]-r[3];
	actualsp+=r[5];
}
var i=this.regionLst.length-1;
this.entire.spnum = this.cumoffset(i,this.regionLst[i][4]);
this.entire.summarySize=this.entire.length/actualsp;
}

function menuJuxtapose()
{
var bbj=gflag.menu.bbj;
var tk=gflag.menu.tklst[0];
if(tk.ft!=FT_bed_n&&tk.ft!=FT_bed_c&&tk.ft!=FT_anno_n&&tk.ft!=FT_anno_c) {
	print2console('tk ft not supported',2);
	return;
}
var c=0;
for(var i=0; i<tk.data.length; i++) {c+=tk.data[i].length;}
if(c>=150) {
	print2console('Cannot run juxtaposition, too many items in the view range. Try zoom in.',2);
	menu_hide();
	return;
}
if(isCustom(tk.ft)) {
	bbj.juxtaposition.type=RM_jux_c;
	bbj.juxtaposition.what=tk.url;
	bbj.juxtaposition.note='custom bed track';
} else {
	bbj.juxtaposition.type=RM_jux_n;
	bbj.juxtaposition.what=tk.name;
	bbj.juxtaposition.note=tk.label;
}
bbj.cloak();
print2console("juxtaposing "+bbj.juxtaposition.note+"...", 0);
var param=bbj.displayedRegionParam()+"&changeGF=on";
bbj.ajaxX(param);
menu_hide();
var synclst=null;
if(gflag.syncviewrange) {
	synclst=gflag.syncviewrange.lst;
}
if(synclst) {
	var j=bbj.juxtaposition;
	for(var i=0; i<synclst.length; i++) {
		synclst[i].juxtaposition={ type:j.type, what:j.what, note:j.note};
		synclst[i].ajaxX(param);
	}
}
}


Browser.prototype.gsv_turnoff=function()
{
this.turnoffJuxtapose(true);
if(gflag.syncviewrange) {
	for(var i=0; i<gflag.syncviewrange.lst.length; i++) {
		gflag.syncviewrange.lst[i].turnoffJuxtapose(true);
	}
}
}

function menuTurnoffJuxtapose()
{
gflag.menu.bbj.turnoffJuxtapose(true);
if(gflag.syncviewrange) {
	for(var i=0; i<gflag.syncviewrange.lst.length; i++) {
		gflag.syncviewrange.lst[i].turnoffJuxtapose(true);
	}
}
}

Browser.prototype.turnoffJuxtapose=function(doajax)
{
/* argument is boolean, if true, will run ajax and show data over default region
no syncing here
*/
menu_hide();
var oldjt = this.juxtaposition.type;
if(oldjt==this.genome.defaultStuff.runmode) return;
this.runmode_set2default();
if(oldjt==RM_jux_n || oldjt==RM_jux_c) {
	if(doajax) {
		this.cloak();
		this.ajaxX(this.displayedRegionParam()+"&changeGF=on");
	}
} else if(oldjt==RM_gsv_c || oldjt==RM_gsv_kegg || oldjt==RM_protein) {
	/* in case of gsv, border must be changed back!
	TODO border be bbj attribute
	*/
	var s=this.genome.scaffold.current;
	this.border={lname:s[0],lpos:0,rname:s[s.length-1],rpos:this.genome.scaffold.len[s[s.length-1]]};
	if(this.genesetview.savelst) {
		// golden has this
		delete this.genesetview.savelst;
	}
	if(doajax) {
		this.cloak();
		var c=this.defaultposition();
		this.ajaxX(this.runmode_param()+'&imgAreaSelect=on&startChr='+c[0]+'&startCoord='+c[1]+'&stopChr='+c[2]+'&stopCoord='+c[3]);
	}
} else {
	fatalError('turnoffJuxtapose: unknown juxtaposition.type '+oldjt);
}
}

Browser.prototype.updateDspstat=function()
{
// updates information about heatmap view (dsp, tracks)
// need to detect uninitiated bbj
if(this.regionLst.length==0) {
	print2console('updateDspstat saw an empty regionLst',2);
	return;
}
var hd=this.header_dspstat;
var W=this.header_naviholder?this.header_naviholder.parentNode.clientWidth:this.hmSpan;
if(hd && hd.allowupdate) {
	if(this.is_gsv()){
		hd.className='header_r';
		if(hd.nocoord) {
			hd.innerHTML='&#10005; GSV';
		} else {
			var w=W-
				(this.header_naviholder?this.header_naviholder.clientWidth:0)-
				(this.header_resolution?this.header_resolution.clientWidth:0)-
				(this.header_utilsholder?this.header_utilsholder.clientWidth:0)-200;
			var perc=Math.min(100,parseInt((this.entire.atbplevel?this.hmSpan/this.entire.bpwidth:this.hmSpan*this.entire.summarySize)*100/this.genesetview.totallen));
			hd.innerHTML=w>250?'Showing '+(perc<100?perc+'% of':'')+' entire set | &#10005;':
						(w>150?'&#10005; turn off GSV': '&#10005; GSV');
		}
	} else {
		hd.className='header_b';
		if(hd.nocoord) {
			// only show chr name
			var x=this.getDspStat();
			var t=x[0]==x[2]?x[0]:(x[0]+'-'+x[2]);
			hd.innerHTML=t.length>20?t.substr(0,15)+'...':t;
		} else {
			var r1 = this.regionLst[this.dspBoundary.vstartr];
			var r2 = this.regionLst[this.dspBoundary.vstopr];
			stripChild(hd,0);
			hd.innerHTML=
				(gflag.dspstat_showgenomename?this.genome.name+'&nbsp':'')+
				(this.genome.defaultStuff.runmode==RM_genome ?
					((r1[0]==r2[0]) ? 
						r1[0]+':'+this.dspBoundary.vstartc+'-'+this.dspBoundary.vstopc :
						'from '+r1[0]+', '+this.dspBoundary.vstartc+' to '+r2[0]+', '+this.dspBoundary.vstopc) :
					(month2sstr[Math.floor(this.dspBoundary.vstartc/100)]+' '+(this.dspBoundary.vstartc%100)+', '+r1[0]+' to '+month2sstr[Math.floor(this.dspBoundary.vstopc/100)]+' '+(this.dspBoundary.vstopc%100)+', '+r2[0]));
		}
	}
}
if(this.header_resolution) {
	if(W<50) {
		this.header_resolution.innerHTML='';
		return;
	}
	var s;
	var unit;
	switch(this.genome.defaultStuff.runmode) {
	case RM_genome: unit='bp';break;
	case RM_yearmonthday: unit='day';break;
	default: fatalError('updateDspstat: unknown .genome.runmode');
	}
	if(this.entire.atbplevel) {
		s=W>250?
			'One '+unit+' spans '+this.entire.bpwidth+' pixels' :
			this.entire.bpwidth+' px/'+unit;
	} else {
		var v=this.entire.summarySize>5 ?  Math.floor(this.entire.summarySize) : this.entire.summarySize.toPrecision(2);
		s=W>250?
			'One pixel spans '+v+' '+unit:
			v+' '+unit+'/px';
	}
	this.header_resolution.innerHTML=s;
}
}

Browser.prototype.runmode_set2default=function()
{
this.juxtaposition.type=this.genome.defaultStuff.runmode;
this.juxtaposition.note=
this.juxtaposition.what=RM2verbal[this.genome.defaultStuff.runmode];
}

Browser.prototype.runmode_param=function()
{
// handyman
if(this.is_gsv()) {
	// TODO enable it for gsv
	print2console('not supposed to call runmode_param() while in gsv mode',2);
	return '';
}
var rm=this.juxtaposition.type;
if(rm==RM_yearmonthday)
	return 'runmode='+rm;
if(rm==RM_genome)
	return 'runmode='+rm;
return 'runmode='+rm+'&juxtaposeTk='+this.juxtaposition.what;
}

function browser_ruler_mover(event)
{
var bbj=gflag.browser;
var h=bbj.sx2rcoord(event.clientX+document.body.scrollLeft-absolutePosition(bbj.hmdiv.parentNode)[0]-bbj.move.styleLeft,true);
if(!h) return;
pica_go(event.clientX,absolutePosition(event.target)[1]+event.target.clientHeight-10-document.body.scrollTop);
if(h.gap) {
	picasays.innerHTML=bbj.tellsgap(h);
} else {
	picasays.innerHTML=h.str+' <span style="font-size:10px;">drag to zoom in</span>';
}
}

Browser.prototype.tellsgap=function(hit)
{
return '<div style="padding:5px;font-size:16px;color:white">'+hit.gap+' bp gap on '+this.genome.name+'<div class=picadim>'+hit.str+'</div></div>';
}




/*** __dsp__ ends ***/



function menu_bbjconfig_show(event)
{
// clicking gear button in bbj header, also show genome info option
menu_shutup();
var bbj=gflag.browser;
menu.bbjconfig.style.display=
menu.c33.style.display='block';
menu.c33.firstChild.innerHTML='About '+bbj.genome.name;
menu.c33.genome=bbj.genome.name;
menu.bbjconfig.leftwidthdiv.style.display=bbj.hmheaderdiv?'table-cell':'none';
menu.bbjconfig.setbutt.style.display='none';
menu.bbjconfig.allow_packhide_tkdata.checked=gflag.allow_packhide_tkdata;
menu_show_beneathdom(0,event.target);
}

function menu_changehmspan(event)
{
// called by pushing button, show indicator3 for how hmspan would be adjusted
var bbj=gflag.menu.bbj;
var t=indicator6;
var w;
if(t.style.display=='none') {
	var pos=absolutePosition(bbj.hmdiv.parentNode);
	t.style.display='block';
	t.style.left=pos[0];
	t.style.top=pos[1];
	t.style.height=bbj.hmdiv.parentNode.clientHeight+bbj.ideogram.canvas.parentNode.parentNode.clientHeight+bbj.decordiv.parentNode.clientHeight;
	w=bbj.hmSpan;
} else {
	w=parseInt(t.style.width);
}
switch(event.target.which) {
case 1: w+=100; break;
case 2: 
	if(w<=min_hmspan) {
		print2console('Cannot shrink width any further',2);
		w=min_hmspan;
	} else {
		w=Math.max(w-100,min_hmspan);
	}
	break;
case 3: w+=10; break;
case 4: 
	if(w<=min_hmspan) {
		print2console('Cannot shrink width any further',2);
		w=min_hmspan;
	} else {
		w=Math.max(w-10,min_hmspan);
	}
	break;
}
t.style.width=w;
var b=menu.bbjconfig.setbutt;
b.style.display='table-cell';
b.disabled=false;
}

function menu_hmspan_set(event)
{
var newhmspan=parseInt(indicator6.style.width);
var bbj=gflag.menu.bbj;
if(newhmspan==bbj.hmSpan) {
	print2console('Same as current width',2);
	return;
}
bbj.sethmspan_refresh(newhmspan);
}

Browser.prototype.sethmspan_refresh=function(val)
{
this.hmSpan=val;
this.applyHmspan2holders();
this.cloak();
this.ajaxX(this.displayedRegionParam()+'&imgAreaSelect=on');
}

function menu_changeleftwidth(event)
{
var bbj=gflag.menu.bbj;
var w=bbj.leftColumnWidth;
switch(event.target.which) {
case 1: w+=20;break;
case 2: w=Math.max(10,w-20);break;
case 3: w+=5;break;
case 4: w=Math.max(10,w-5);break;
}
bbj.leftColumnWidth=w;
for(var i=0; i<bbj.tklst.length; i++) {
	bbj.drawTrack_header(bbj.tklst[i]);
}
bbj.drawATCGlegend(false);
//bbj.mcmPlaceheader();
}



/*** __track__ ***/

function track_Mout(event)
{
var bbj=gflag.browser;
var tk=bbj.findTrack(event.target.tkname,event.target.cotton);
if(!tk) {
	// this is the case for alethiometer splinter
	return;
}
if(!tk.menuselected) {
	tk.header.style.backgroundColor='transparent';
}
pica_hide();
glasspane.style.display=
smear1.style.display=smear2.style.display=
indicator.style.display=indicator6.style.display='none';
}

function track_Mmove(event)
{
/* must tell if this track is from a splinter
*/
var sbj=gflag.browser;
var tk=sbj.findTrack(event.target.tkname,event.target.cotton);
if(!tk) {
	pica_hide();
	return;
}
pica.tk=tk;
if(tk.header && !tk.menuselected) {
	tk.header.style.backgroundColor=colorCentral.tkentryfill;
}
var x=event.clientX,
	y=event.clientY;
var pos=absolutePosition(sbj.hmdiv.parentNode);

if(sbj.weaver && sbj.weaver.mode==W_rough) {
	if(tk.ft!=FT_weaver_c) {
		// activate smears
		var tn=tk.name+tk.cotton;
		var h=0;
		var where=1;
		for(var i=0; i<sbj.tklst.length; i++) {
			var t=sbj.tklst[i];
			if(tkishidden(t)) continue;
			if(t.name+t.cotton==tn) break;
			h+=t.canvas.height+parseInt(t.canvas.style.paddingBottom);
			if(t.where!=where) {
				h+=sbj.ideogram.canvas.height;
				where=t.where;
			}
		}
		if(h>0) {
			smear1.style.display='block';
			smear1.style.left=pos[0];
			smear1.style.top=pos[1];
			smear1.style.width=sbj.hmSpan;
			smear1.style.height=h;
		}
		var h2=0;
		for(; i<sbj.tklst.length; i++) {
			var t=sbj.tklst[i];
			if(tkishidden(t)) continue;
			if(t.name+t.cotton==tn) break;
			h2+=t.canvas.height+parseInt(t.canvas.style.paddingBottom);
		}
	}
	if(tk.cotton && tk.ft!=FT_weaver_c) {
		// over cottontk
	} else if(!tk.cotton) {
		// over target tk
	}
}

if(tk.cotton && tk.ft!=FT_weaver_c) {
	// this is cotton track, switch to cotton bbj
	sbj=sbj.weaver.q[tk.cotton];
}
var hitpoint=sbj.sx2rcoord(x+document.body.scrollLeft-pos[0]-sbj.move.styleLeft,true);
if(!hitpoint) {
	// no man land, possible for inter-hsp in query genome
	pica_hide();
	glasspane.style.display='none';
	return;
}
var A=hitpoint.rid, B=hitpoint.sid;
if(tk.cotton && tk.ft!=FT_weaver_c && sbj.weaver.target.weaver.mode==W_rough) {
	var tbj=sbj.weaver.target;
	// cotton, check if cursor is in an hsp
	var _x=x-absolutePosition(tbj.hmdiv.parentNode)[0]+document.body.scrollLeft-sbj.move.styleLeft;
	var r=sbj.regionLst[A];
	var s=r[8].stitch;
	var lst=tbj.stitch2hithsp(s,_x);
	for(var i=0; i<lst.length; i++) {
		lst[i][1]=lst[i][2]=-1;
	}
	tbj.weaver_stitch_decor(
		sbj.weaver.track,
		lst,
		_x,
		-1,-1,
		hitpoint.str);
}
var result=sbj.gettkitem_cursor(tk,x,y);
if(tk.ft==FT_weaver_c) {
	glasspane.style.display='none';
	if(!result) {
		pica_hide();
		return;
	}
	stripChild(picasays,0);
	pica.style.display='block';
	pica.style.left=x-100;
	pica.style.right='';
	var ytk=absolutePosition(tk.canvas)[1];
	pica.style.top=ytk+tk.canvas.height-document.body.scrollTop;
	pica.style.bottom='';
	sbj.weaver_detail( x+document.body.scrollLeft-pos[0]-sbj.move.styleLeft, hitpoint,result,tk,picasays);
	if(result.stitch) {
		var _x=x-absolutePosition(sbj.hmdiv.parentNode)[0]+document.body.scrollLeft-sbj.move.styleLeft;
		var s=result.stitch;
		var querycoord=s.chr+' '+parseInt(s.start+(s.stop-s.start)*(_x-s.canvasstart)/(s.canvasstop-s.canvasstart));

		if(result.hsp) {
			sbj.weaver_stitch_decor(tk,
				sbj.stitch2hithsp(s,_x),
				_x,
				result.hsp.q1,
				result.hsp.q2,
				querycoord
			);
		} else {
			// no hit to hsp
			sbj.weaver_stitch_decor(tk,
				[],
				_x,
				-1,-1,
				querycoord
			);
		}
	}
	return;
}
if(hitpoint.gap) {
	pica_go(x,y);
	picasays.innerHTML=sbj.tellsgap(hitpoint);
	return;
}
if(result==null) {
	pica_hide();
	return;
}
var cottonlabel=tk.cotton?'<span style="background-color:'+sbj.weaver.track.qtc.bedcolor+';color:white;">&nbsp;'+tk.cotton+'&nbsp;</span>':'';
if(tk.mode==M_arc || tk.mode==M_trihm) {
	if(tk.mode==M_arc) {
		if(!result) {
			pica_hide();
			return;
		}
		picasays.innerHTML='Score: '+tk.data_chiapet[result[3]][result[4]].name;
		pica_go(x,y);
		return;
	}
	// trihm
	var isld=tk.ft==FT_ld_c||tk.ft==FT_ld_n;
	if(!result) {
		pica_hide();
		indicator.style.display=indicator6.style.display='none';
		if(isld) glasspane.style.display='none';
		return;
	}
	var item2=tk.data_chiapet[result[4]][result[5]];
	if(item2.struct.L.rid==item2.struct.R.rid && item2.struct.L.stop>=item2.struct.R.start) {
		if(isld) {
			glasspane.style.display='none';
		}
		return;
	}
	// ld differs from lr here
	if(isld) {
		// find left/right snp by xpos
		var tmp=findSnp_ldtk(tk,result,item2);
		var rs1=tmp[0],rs2=tmp[1];
		if(rs1==null || rs2==null) {
			glasspane.style.display='none';
			return;
		}
		// paint path from beam to snp
		glasspane.style.display='block';
		glasspane.width=sbj.hmSpan;
		glasspane.height=tk.ld.ticksize+tk.ld.topheight;
		glasspane.style.left=pos[0];
		glasspane.style.top=absolutePosition(tk.canvas)[1];
		var ctx=glasspane.getContext('2d');
		ctx.fillStyle='rgba('+tk.qtc.pr+','+tk.qtc.pg+','+tk.qtc.pb+',0.5)';
		// left
		var a=tk.ld.hash[rs1];
		var b=a.bottomx+sbj.move.styleLeft;
		var w=result[2];
		ctx.beginPath();
		ctx.moveTo(a.topx+sbj.move.styleLeft-.5,tk.ld.ticksize);
		ctx.lineTo(b-w/2-1,glasspane.height);
		ctx.lineTo(b+w/2+1,glasspane.height);
		ctx.lineTo(a.topx+sbj.move.styleLeft+.5,tk.ld.ticksize);
		ctx.closePath();
		ctx.fill();
		// right
		a=tk.ld.hash[rs2];
		b=a.bottomx+sbj.move.styleLeft;
		w=result[3];
		ctx.beginPath();
		ctx.moveTo(a.topx+sbj.move.styleLeft-.5,tk.ld.ticksize);
		ctx.lineTo(b-w/2-1,glasspane.height);
		ctx.lineTo(b+w/2+1,glasspane.height);
		ctx.lineTo(a.topx+sbj.move.styleLeft+.5,tk.ld.ticksize);
		ctx.closePath();
		ctx.fill();
	} else {
		var Y=pos[1];
		var H=sbj.hmdiv.clientHeight+sbj.decordiv.clientHeight+sbj.ideogram.canvas.height;
		// left beam
		var _x=item2.boxstart+sbj.move.styleLeft;
		if(_x+result[2]>0) {
			indicator.style.display='block';
			indicator.style.height=H;
			indicator.style.top=Y;
			indicator.style.left=Math.max(pos[0],_x+pos[0]);
			indicator.style.width=Math.min(_x+result[2],result[2]);
		} else {
			indicator.style.display='none';
		}
		// right beam
		_x=item2.boxstart+item2.boxwidth+sbj.move.styleLeft-result[3];
		if(_x<sbj.hmSpan) {
			indicator6.style.display='block';
			indicator6.style.height=H;
			indicator6.style.top=Y;
			indicator6.style.left=_x+pos[0];
			indicator6.style.width=Math.min(sbj.hmSpan-_x,result[3]);
		} else {
			indicator6.style.display='none';
		}
	}
	picasays.innerHTML='Score: '+tk.data_chiapet[result[4]][result[5]].name;
	pica_go(x,y);
	return;
}
if(tk.mode==M_bar) {
	if(result.length>0) {
		pica_go(x,y);
		stripChild(picasays,0);
		var d=dom_create('div',picasays,'padding:5px;font-size:16px;color:white');
		for(var i=0; i<Math.min(4,result.length); i++) {
			var lst=[];
			var n=result[i].name2?result[i].name2:result[i].name;
			if(n) {
				lst.push(n);
			}
			if(tk.showscoreidx>=0) {
				lst.push(result[i].scorelst[tk.showscoreidx]+' <span style="font-size:80%;opacity:.8;">'+tk.scorenamelst[tk.showscoreidx]+'</span>');
			}
			if(result[i].category!=undefined && tk.cateInfo) {
				lst.push('<span class=squarecell style="padding:0px 8px;background-color:'+tk.cateInfo[result[i].category][1]+';">&nbsp;</span> <span style="font-size:80%;">'+tk.cateInfo[result[i].category][0]+'</span>');
			}
			dom_create('div',d,'margin:5px;').innerHTML=lst.join('<br>');
		}
		if(result.length>4) {
			dom_create('div',d,'margin-top:3px;border-top:1px solid white;opacity:.7;font-size:70%;text-align:center;').innerHTML=(result.length-4)+' NOT SHOWN';
		}
		var s=result.length==1?result[0].strand:null;
		dom_create('div',d,'margin:5px;',{c:'picadim',t:tk.label+
			'<br>'+hitpoint.str+' '+
			((s && s!='.')?('<span style="font-size:150%;">'+((s=='>'||s=='+')?'&raquo;':'&laquo;')+'</span>'):'')
			});
		if(cottonlabel) dom_create('div',d).innerHTML=cottonlabel;
	} else {
		pica_hide();
	}
	return;
}
if(tk.ft==FT_cat_n||tk.ft==FT_cat_c) {
	pica_go(x,y);
	picasays.innerHTML= '<div style="padding:5px;font-size:16px;color:white">'+
		'<div class=squarecell style="display:inline-block;background-color:'+result[1]+'"></div> '+result[0]+
		'<div class=picadim>'+ tk.label+
		'<br>'+hitpoint.str+'</div>'+cottonlabel+'</div>';
	return;
}
if(tk.ft==FT_catmat) {
	pica_go(x,y);
	picasays.innerHTML= '<div style="padding:5px;font-size:16px;color:white">'+
		'<div class=squarecell style="display:inline-block;background-color:'+result[1]+'"></div> '+result[0]+
		'<div class=picadim>'+ tk.label+
		'<br>'+hitpoint.str+'</div>'+cottonlabel+'</div>';
	return;
}
if(tk.ft==FT_qcats) {
	pica_go(x,y);
	var quantity=result[0];
	var cat=result[1];
	picasays.innerHTML= '<div style="padding:5px;font-size:16px;color:white">'+
		'<div class=squarecell style="display:inline-block;background-color:'+cat[1]+'"></div> '+cat[0]+
		'<div>'+quantity+'</div>'+
		'<div class=picadim>'+ tk.label+
		'<br>'+hitpoint.str+'</div>'+cottonlabel+'</div>';
	return;
}
if(isNumerical(tk)) {
	// no matter whether the track is in ghm or decor, the x is same
	pica_go(x,y);
	var str='<div style="padding:5px;font-size:16px;color:white">';
	if(isNaN(result)) {
		str+='No data';
	} else if(tk.normalize) {
		var n=sbj.track_normalize(tk,result);
		str+=neatstr(n)+' ('+tk.normalize.method+')'+
			'<br><span style="font-size:12px">'+result+' (raw)</span>';
	} else {
		str+=result+(tk.qtc.height<20?'<div style="font-size:70%;opacity:.8">min: '+tk.minv+', max: '+tk.maxv+'</div>':'');
	}
	picasays.innerHTML= str+ '<div class=picadim>'+tk.label+
		'<br>'+hitpoint.str+'</div>'+cottonlabel+'</div>';
	return;
}
if(tk.ft==FT_matplot) {
	var str=[];
	for(var i=0; i<tk.tracks.length; i++) {
		var _t=tk.tracks[i];
		var v=_t.data[A][B];
		if(!isNaN(v)) {
			v=sbj.track_normalize(_t,v);
			var q=_t.qtc;
			str.push('<tr><td class=squarecell style="background-color:rgb('+q.pr+','+q.pg+','+q.pb+')"></td><td valign=top>'+neatstr(v)+'</td><td style="font-size:70%;">'+_t.label+'</td></tr>');
		}
	}
	//pica_go(pos[0]+sbj.hmSpan-10,pos[1]-10);
	pica_go(x,y);
	picasays.innerHTML= '<table style="margin:5px;color:white">'+
		str.join('')+'<tr><td colspan=3 style="padding-top:5px">'+hitpoint.str+cottonlabel+'</td></tr></table>';
	return;
}
if(tk.ft==FT_cm_c) {
	picasays.innerHTML=cmtk_detail(tk,A,B)+
		'<div class=picadim style="margin:10px;">'+tk.label+
		'<br>'+hitpoint.str+'</div>'+
		(cottonlabel?'<div style="margin:10px;">'+cottonlabel+'</div>':'');
	pica_go(x,y);
	return;
}
// remainder, stacked items
if(tk.ft==FT_lr_n || tk.ft==FT_lr_c) {
	picasays.innerHTML='<div style="padding:5px;">Score: '+
		(result.hasmate? result.name : result.name.split(',')[1])+'<div class=picadim>'+tk.label+
		'<br>'+hitpoint.str+'</div>'+cottonlabel+'</div>';
	pica_go(x,y);
	return;
}
var s=result.strand;
picasays.innerHTML='<div style="padding:5px;"><div style="color:white;line-height:1.5;">'+
	(result.name2?result.name2:(result.name?result.name:((tk.ft==FT_bam_n||tk.ft==FT_bam_c)?'Read':'Unamed item')))+'<br>'+
	((result.category!=undefined && tk.cateInfo) ?
		'<span class=squarecell style="padding:0px 8px;background-color:'+tk.cateInfo[result.category][1]+';">&nbsp;</span> '+tk.cateInfo[result.category][0]+'<br>':'')+
	(result.scorelst?(tk.showscoreidx>=0?
		result.scorelst[tk.showscoreidx]+' <span style="font-size:80%;opacity:.8;">'+tk.scorenamelst[tk.showscoreidx]+'</span>'
		:''):'')+
	'</div><div class=picadim>'+tk.label+
	'<br>'+hitpoint.str+
	((s && s!='.')?('<span style="font-size:150%;">&nbsp;'+((s=='>'||s=='+')?'&raquo;':'&laquo;')+'</span>'):'')+
	'</div>'+cottonlabel+'</div>';
pica_go(x,y);
}





Browser.prototype.gettkitem_cursor=function(tk,x,y)
{
/* x/y: event.clientX/Y
if at barplot, will return a list of items
*/
x=x+document.body.scrollLeft-absolutePosition(this.hmdiv.parentNode)[0]-this.move.styleLeft;
y=y+document.body.scrollTop-absolutePosition(tk.canvas)[1];
if(tk.mode==M_arc || tk.mode==M_trihm) {
	if(tk.mode==M_arc) {
		return findDecoritem_longrange_arc(tk.data_arc, x, y);
	}
	return findDecoritem_longrange_trihm(tk.data_trihm,
		tk.qtc.anglescale*Math.PI/4,
		x,y);
}
var hitpoint=this.sx2rcoord(x,true);
if(!hitpoint) return null;
var A=hitpoint.rid, B=hitpoint.sid;

if(tk.mode==M_bar) {
	if(y<=densitydecorpaddingtop+tk.qtc.height+1) {
		// cursor over bars
		var hits=[];
		for(var i=0; i<tk.data[A].length; i++) {
			var item=tk.data[A][i];
			if(item.start<=hitpoint.coord && item.stop>=hitpoint.coord) {
				hits.push(item);
			}
		}
		return hits;
	} else {
		// cursor over item boxes
		var clickstack = parseInt((y-densitydecorpaddingtop-tk.qtc.height-1) / (fullStackHeight+1));
		for(var i=0; i<tk.data[A].length; i++) {
			var item=tk.data[A][i];
			if(item.stack==clickstack && item.start<=hitpoint.coord && item.stop>=hitpoint.coord) {
				return [item];
			}
		}
	}
	return [];
}
if(isNumerical(tk)) {
	if(A>=tk.data.length) return null;
	if(B>=tk.data[A].length) return null;
	return tk.data[A][B];
}
switch(tk.ft) {
case FT_cat_n:
case FT_cat_c:
	return tk.cateInfo[tk.data[A][B]];
case FT_matplot:
	return true;
case FT_cm_c:
	return true;
case FT_anno_n:
case FT_anno_c:
case FT_bam_n:
case FT_bam_c:
case FT_bed_n:
case FT_bed_c:
case FT_lr_n:
case FT_lr_c:
case FT_weaver_c:
	if(tk.ft==FT_weaver_c && tk.weaver.mode==W_rough) {
		if(y>=tk.canvas.height-fullStackHeight) {
			// over query stitch
			for(var i=0; i<tk.weaver.stitch.length; i++) {
				var s=tk.weaver.stitch[i];
				if(x<s.canvasstart || x>s.canvasstop) continue;
				var perc= (x-s.canvasstart)/(s.canvasstop-s.canvasstart);
				var re={stitch:s,
					query:s.chr+':'+(s.start+parseInt((s.stop-s.start)*perc)),
					};
				for(var j=0; j<s.lst.length; j++) {
					var h=s.lst[j];
					// using on screen pos of query, not target!
					var a=h.strand=='+' ? h.q1 : h.q2,
						b=h.strand=='+' ? h.q2 : h.q1;
					if(x>=a && x<=b) {
						re.hsp=h;
						perc=(x-h.q1)/(h.q2-h.q1);
						re.target=this.regionLst[h.targetrid][0]+':'+
							(h.targetstart+parseInt((h.targetstop-h.targetstart)*perc));
						return re;
					}
				}
				return re;
			}
		} else {
			// may target
		}
		return null;
	}
	var clickstack;
	if(tk.ft==FT_weaver_c) {
		clickstack=parseInt((y-weavertkpad)/(tk.qtc.stackheight+1));
	} else {
		var stkh = tk.mode==M_full ? fullStackHeight+1 : thinStackHeight+1;
		clickstack = parseInt(y / (stkh));
	}
	var _data=(tk.ft==FT_lr_n||tk.ft==FT_lr_c) ? tk.data_chiapet : tk.data;
	for(var i=0; i<_data.length; i++) {
		for(var j=0; j<_data[i].length; j++) {
			var item = _data[i][j];
			if(item.stack==undefined || item.stack!=clickstack) continue;
			if(item.stackstart>=0) {
				if(item.stackstart<=x && item.stackstart+item.stackwidth>=x) {
					return item;
				}
			} else {
				if(item.start<=hitpoint.coord && item.stop>hitpoint.coord) {
					return item;
				}
			}
		}
	}
	return null;
case FT_catmat:
	if(y<=1) return null;
	if(!tk.data[A]) return null;
	for(var i=0; i<tk.data[A].length; i++) {
		var item=tk.data[A][i];
		if(item.start<=hitpoint.coord && item.stop>=hitpoint.coord) {
			return tk.cateInfo[item.layers[parseInt((y-1)/tk.rowheight)]];
		}
	}
	return null;
case FT_qcats:
	if(y<=1) return null;
	if(!tk.data[A]) return null;
	for(var i=0; i<tk.data[A].length; i++) {
		var item=tk.data[A][i];
		if(item.start<=hitpoint.coord && item.stop>=hitpoint.coord) {
			for(var j=0; j<item.qcat.length; j++) {
				var q=item.qcat[j];
				if(q[3]<=y && q[3]+q[4]>=y) {
					return [ q[0], tk.cateInfo[q[1]] ];
				}
			}
		}
	}
	return null;
default: fatalError('unknown tk ft');
}
}








function findSnp_ldtk(tk,item,item2)
{
/* item: tk.data_trihm
item2: tk.data_chiapet
*/
var a=item2.boxstart+item2.boxwidth;
var rs1=null,rs2=null;
for(var k in tk.ld.hash) {
	var x=tk.ld.hash[k].bottomx;
	if(rs1==null && (x>item2.boxstart && x<item2.boxstart+item[2])) {
		rs1=k;
		if(rs2!=null) return [rs1,rs2];
	}
	if(rs2==null && (x>a-item[3] && x<a)) {
		rs2=k;
		if(rs1!=null) return [rs1,rs2];
	}
}
return [rs1,rs2];
}

function duplicateTkobj(o)
{
var o2={name:o.name,
	label:o.label,
	ft:o.ft,
	url:o.url,
	qtc:{},
	mode:isHmtk(o.ft)?M_show:M_den,
};
if(o.ft==FT_weaver_c) {
	o2.cotton=o.cotton;
}
qtc_paramCopy(o.qtc, o2.qtc);
if(o.cateInfo) {
	o2.cateInfo={};
	cateInfo_copy(o.cateInfo,o2.cateInfo);
}
return o2;
}

Genome.prototype.replicatetk=function(t)
{
// make tkobj to go into datahub
var _o={}; // temp obj for stringify
if(t.ft==FT_cm_c) {
	if(t.cm.combine) {
		_o.combinestrands=true;
	}
	if(t.cm.combine_chg) {
		_o.combinestrands_chg=true;
	}
	if(t.cm.scale) {
		_o.scalebarheight=true;
	}
	if(t.cm.filter) {
		_o.filterreaddepth=t.cm.filter;
	}
	// smooth?
	var trd=t.cm.set.rd_f;
	if(trd && trd.qtc && trd.qtc.smooth) {
		_o.smoothwindow=trd.qtc.smooth;
	}
	_o.tracks={forward:{},reverse:{}};
	var no_r=true;
	// if t is registry object, the member tracks are just names
	if(t.cm.set.cg_f) {
		if(typeof(t.cm.set.cg_f)=='string') {
			var o3=this.hmtk[t.cm.set.cg_f];
			if(o3) {
				_o.tracks.forward.CG={color:t.cm.color.cg_f,bg:t.cm.bg.cg_f,url:o3.url};
			}
		} else {
			_o.tracks.forward.CG={color:t.cm.color.cg_f,bg:t.cm.bg.cg_f,url:t.cm.set.cg_f.url};
		}
	}
	if(t.cm.set.cg_r) {
		if(typeof(t.cm.set.cg_r)=='string') {
			var o3=this.hmtk[t.cm.set.cg_r];
			if(o3) {
				_o.tracks.reverse.CG={color:t.cm.color.cg_r,bg:t.cm.bg.cg_r,url:o3.url};
				no_r=false;
			}
		} else {
			_o.tracks.reverse.CG={color:t.cm.color.cg_r,bg:t.cm.bg.cg_r,url:t.cm.set.cg_r.url};
			no_r=false;
		}
	}
	if(t.cm.set.chg_f) {
		if(typeof(t.cm.set.chg_f)=='string') {
			var o3=this.hmtk[t.cm.set.chg_f];
			if(o3) {
				_o.tracks.forward.CHG={color:t.cm.color.chg_f,bg:t.cm.bg.chg_f,url:o3.url};
			}
		} else {
			_o.tracks.forward.CHG={color:t.cm.color.chg_f,bg:t.cm.bg.chg_f,url:t.cm.set.chg_f.url};
		}
	}
	if(t.cm.set.chg_r) {
		if(typeof(t.cm.set.chg_r)=='string') {
			var o3=this.hmtk[t.cm.set.chg_r];
			if(o3) {
				_o.tracks.reverse.CHG={color:t.cm.color.chg_r,bg:t.cm.bg.chg_r,url:o3.url};
				no_r=false;
			}
		} else {
			_o.tracks.reverse.CHG={color:t.cm.color.chg_r,bg:t.cm.bg.chg_r,url:t.cm.set.chg_r.url};
			no_r=false;
		}
	}
	if(t.cm.set.chh_f) {
		if(typeof(t.cm.set.chh_f)=='string') {
			var o3=this.hmtk[t.cm.set.chh_f];
			if(o3) {
				_o.tracks.forward.CHH={color:t.cm.color.chh_f,bg:t.cm.bg.chh_f,url:o3.url};
			}
		} else {
			_o.tracks.forward.CHH={color:t.cm.color.chh_f,bg:t.cm.bg.chh_f,url:t.cm.set.chh_f.url};
		}
	}
	if(t.cm.set.chh_r) {
		if(typeof(t.cm.set.chh_r)=='string') {
			var o3=this.hmtk[t.cm.set.chh_r];
			if(o3) {
				_o.tracks.reverse.CHH={color:t.cm.color.chh_r,bg:t.cm.bg.chh_r,url:o3.url};
				no_r=false;
			}
		} else {
			_o.tracks.reverse.CHH={color:t.cm.color.chh_r,bg:t.cm.bg.chh_r,url:t.cm.set.chh_r.url};
			no_r=false;
		}
	}
	if(t.cm.set.rd_f) {
		if(typeof(t.cm.set.rd_f)=='string') {
			var o3=this.hmtk[t.cm.set.rd_f];
			if(o3) {
				_o.tracks.forward.ReadDepth={color:t.cm.color.rd_f,bg:t.cm.bg.rd_f,url:o3.url};
			}
		} else {
			_o.tracks.forward.ReadDepth={color:t.cm.color.rd_f,bg:t.cm.bg.rd_f,url:t.cm.set.rd_f.url};
		}
	}
	if(t.cm.set.rd_r) {
		if(typeof(t.cm.set.rd_r)=='string') {
			var o3=this.hmtk[t.cm.set.rd_r];
			if(o3) {
				_o.tracks.reverse.ReadDepth={color:t.cm.color.rd_r,bg:t.cm.bg.rd_r,url:o3.url};
				no_r=false;
			}
		} else {
			_o.tracks.reverse.ReadDepth={color:t.cm.color.rd_r,bg:t.cm.bg.rd_r,url:t.cm.set.rd_r.url};
			no_r=false;
		}
	}
	if(no_r) {
		delete _o.tracks.reverse;
	}
} else if(t.ft==FT_matplot) {
	var lst=[];
	for(var i=0; i<t.tracks.length; i++) {
		var t2=t.tracks[i];
		// t2 will be tkname if t is registry obj
		if(typeof(t2)=='string') {
			var t3=this.getTkregistryobj(t2);
			if(t3) {
				lst.push({type:FT2verbal[t3.ft],
					url:t3.url,
					name:t3.label,
					colorpositive:'rgb('+t3.qtc.pr+','+t3.qtc.pg+','+t3.qtc.pb+')',
				});
			}
		} else {
			lst.push({type:FT2verbal[t2.ft],
				url:t2.url,
				name:t2.label,
				colorpositive:'rgb('+t2.qtc.pr+','+t2.qtc.pg+','+t2.qtc.pb+')',
				});
		}
	}
	_o.tracks=lst;
} else if(t.ft==FT_catmat) {
	_o.rowcount=t.rowcount;
	_o.rowheight=t.rowheight;
} else if(t.ft==FT_weaver_c) {
	_o.querygenome=t.cotton;
	_o.color=t.qtc.bedcolor;
	_o.weaver={};
}

if(isCustom(t.ft)) {
	_o.type=FT2verbal[t.ft];
	_o.name=t.label;
	_o.url=t.url;
	//if(t.public) { _o.public=true; }
} else {
	_o.name=t.name;
}
_o.mode=t.mode;
if(t.defaultmode!=undefined) {
	_o.defaultmode=t.defaultmode;
}
if(t.qtc) {
	_o.qtc=t.qtc;
}
if(t.showscoreidx!=undefined) {
	_o.showscoreidx=t.showscoreidx;
	_o.scorenamelst=t.scorenamelst;
	_o.scorescalelst=t.scorescalelst;
}
if(t.md) {
	_o.metadata={};
	for(var i=0; i<t.md.length; i++) {
		if(t.md[i]) {
			if(gflag.mdlst[i].tag==literal_imd) {
				// skip internal md
				continue;
			}
			var a=[];
			for(var n in t.md[i]) {
				a.push(n);
			}
			_o.metadata['md'+i]=a;
		}
	}
}
if(t.cateInfo) {
	_o.categories=t.cateInfo;
}
if(t.details) {
	_o.details=t.details;
}
if(t.geolst) {
	_o.geolst=t.geolst;
}
if(t.group!=undefined) {
	_o.group=t.group;
}
if(t.horizontallines) {
	_o.horizontallines=t.horizontallines;
}
return _o;
}



function grandaddtracks(event)
{
menu_shutup();
menu.grandadd.style.display='block';
menu_show_beneathdom(12, event.target);
gflag.browser.grandshowtrack();
//menu.grandadd.kwinput.focus();
}

Browser.prototype.grandshowtrack=function()
{
gflag.menu.bbj=this;
if(!this.header) {
	menu.grandadd.says.style.display=
	menu.grandadd.pubh.style.display=
	menu.grandadd.cust.style.display='block';
} else {
	menu.grandadd.says.style.display=this.header.no_number?'none':'block';
	menu.grandadd.pubh.style.display=this.header.no_publichub?'none':'block';
	menu.grandadd.cust.style.display=this.header.no_custtk?'none':'block';
	if(this.header.no_number) return;
}
var tmp=this.tkCount();
var total=tmp[0],
	ctotal=tmp[1];
var show=0;
var cshow=0;
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if(tkishidden(t)) continue;
	if(t.name in this.genome.decorInfo) continue;
	if(this.weaver && !this.weaver.iscotton) {
		// is target bbj
		if(t.cotton && t.ft!=FT_weaver_c) continue;
		// is cottontk, skip
	}
	show++;
	if(!t.public && isCustom(t.ft)) {
		cshow++;
	}
}
var s=menu.grandadd.says;
if(total==0) {
	s.style.display='none';
} else {
	s.style.display='block';
	stripChild(s,0);
	var t=dom_create('table',s);
	var tr=t.insertRow(0);
	var td=tr.insertCell(0);
	td.vAlign='top';
	dom_create('span',td,'font-size:250%;font-weight:bold;').innerHTML=total;
	td=tr.insertCell(1);
	td.vAlign='top';
	td.style.paddingTop=5;
	td.innerHTML='<span style="opacity:.6;font-size:70%;">TOTAL</span> / <span style="font-weight:bold;font-size:normal">'+show+'</span> <span style="opacity:.6;font-size:70%;">SHOWN</span>';
	dom_create('div',s,'font-size:70%;opacity:.6;').innerHTML='CLICK FOR TRACK TABLE';
}
menu.grandadd.custtkcount.innerHTML=ctotal>0?'('+ctotal+')':'';
if(this.weaver) {
	stripChild(menu.c32,0);
	menu.c32.style.display='block';
	if(this.weaver.iscotton) {
		dom_create('div',menu.c32,'background-color:#858585;color:white;text-align:center;').innerHTML='tracks from '+this.genome.name;
	} else if(this.weaver.q) {
		// need to see if cotton genome is ansible, if so, no tracks
		var d=dom_create('div',menu.c32,'padding:15px;border-top:1px solid #ccc;');
		dom_addtext(d,'Show tracks for:').style.opacity='0.7';
		for(var n in this.weaver.q) {
			dom_create('div',d,'margin:10px;padding:5px;display:inline-block;',{c:'header_g',t:n,clc:weaver_showgenometk_closure(n)});
		}
	}
}
}

function toggle28()
{
menu_shutup();
menu.c35.style.display='block';
var b=gflag.menu.bbj;
var ctotal=b.tkCount()[1];
if(ctotal==0) {
	menu.c35.says.innerHTML='None yet.';
	menu.c35.opt.style.display='none';
} else {
	menu.c35.says.innerHTML='<span style="font-size:150%">'+ctotal+'</span> <span style="font-size:70%">TOTAL</span>';
	menu.c35.opt.style.display='block';
}
if(b.weaver && b.weaver.iscotton) {
	stripChild(menu.c32,0);
	menu.c32.style.display='block';
	dom_create('div',menu.c32,'background-color:#858585;color:white;text-align:center;').innerHTML='tracks from '+b.genome.name;
}
}


Browser.prototype.highlighttrack=function(lst)
{
/* put indicator over some tracks
the tracks must be next to each other
first element in the list is assumed to be the one on top (determines box position)
*/
var pos=absolutePosition(lst[0].canvas);
var h=0;
for(var i=0; i<lst.length; i++) {
	h+=tk_height(lst[i])+parseInt(lst[i].canvas.style.paddingBottom);
}
placeIndicator3(pos[0]-this.move.styleLeft, pos[1], this.hmSpan, h);
}


Browser.prototype.findTrack=function(tkname,cotton)
{
// display object
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if(t.name==tkname) {
		if(t.ft==FT_weaver_c) {
			/* better logic here
			target bbj finding weavertk, no worry about cotton
			*/
			return t;
		}
		if(this.weaver && this.weaver.iscotton) {
			// cottonbbj looking through
			return t;
		}
		if(cotton) {
			if(t.cotton && cotton==t.cotton) return t;
		} else {
			if(!t.cotton) return t;
		}
	}
}
return null;
}

Browser.prototype.removeTrackCanvas=function(tk)
{
if(tk.where==1) {
	if(this.hmheaderdiv && tk.header) {
		try { this.hmheaderdiv.removeChild(tk.header);
		} catch(e) {
			print2console('stray tk header: '+tk.label,2);
		}
	}
	if(tk.canvas) {
		try { this.hmdiv.removeChild(tk.canvas);
		} catch(e) {
			print2console('stray tk canvas: '+tk.label,2);
		}
	}
	if(this.mcm && tk.atC) {
		try { this.mcm.tkholder.removeChild(tk.atC);
		} catch(e) {
			print2console('stray tk atC: '+tk.atC,2);
		}
	}
} else {
	if(this.decorheaderdiv && tk.header) {
		try { this.decorheaderdiv.removeChild(tk.header);
		} catch(e) {
			print2console('stray tk header: '+tk.label,2);
		}
	}
	if(tk.canvas) {
		try { this.decordiv.removeChild(tk.canvas);
		} catch(e) {
			print2console('stray tk canvas: '+tk.label,2);
		}
	}
}
}
Browser.prototype.removeTrack=function(namelst)
{
/* remove a track from view
special treatment for matplot
no special for cmtk
*/
var hashmtk=false;
for(var i=0; i<namelst.length; i++) {
	var tk=this.findTrack(namelst[i]);
	if(!tk) continue;
	if(!tkishidden(tk)) {
		this.removeTrackCanvas(tk);
		if(tk.where==1) {
			hashmtk=true;
		}
	}
	for(var j=0; j<this.tklst.length; j++) {
		if(this.tklst[j].name==namelst[i]) {
			this.tklst.splice(j,1);
			break;
		}
	}
}
if(this.weaver && this.weaver.iscotton) {
	// cottonbbj removing, must also remove from target
	var tbj=this.weaver.target;
	for(var i=0; i<namelst.length; i++) {
		for(var j=0; j<tbj.tklst.length; j++) {
			var t=tbj.tklst[j];
			if(t.name==namelst[i] && t.cotton==this.genome.name) {
				tbj.tklst.splice(j,1);
				break;
			}
		}
	}
}
// after removing
var bbj=this;
if(this.weaver && this.weaver.iscotton) {
	bbj=this.weaver.target;
}
if(hashmtk) {
	bbj.prepareMcm();
	bbj.drawMcm();
}
bbj.trackHeightChanged();
// to solve the problem that trihm pillars don't hide
indicator.style.display=indicator6.style.display='none';
bbj.aftertkaddremove(namelst);
for(var tag in this.splinters) {
	this.splinters[tag].removeTrack(namelst);
}
}



Genome.prototype.getTkregistryobj=function(name,ft)
{
var o=this.hmtk[name];
if(!o) {
	o=this.decorInfo[name];
	if(!o) {
		if(__request_tk_registryobj) {
			o=__request_tk_registryobj(name,ft);
		}
	}
}
return o;
}


function tk_applydefaultstyle(tk)
{
if(!tk.qtc) {
	tk.qtc={};
}
switch(tk.ft) {
case FT_bed_n:
case FT_anno_n:
case FT_sam_n:
case FT_bam_n:
case FT_lr_n:
case FT_ld_n:
case FT_bed_c:
case FT_anno_c:
	qtc_paramCopy(defaultQtcStyle.density, tk.qtc);
	qtc_paramCopy(defaultQtcStyle.anno,tk.qtc);
	break;
case FT_weaver_c:
	tk.qtc.bedcolor=weavertkcolor_query;
	tk.qtc.height=60;
	break;
case FT_bedgraph_n:
	qtc_paramCopy(defaultQtcStyle.heatmap, tk.qtc);
	break;
case FT_bedgraph_c:
	qtc_paramCopy(defaultQtcStyle.ft3, tk.qtc);
	break;
case FT_sam_c:
case FT_bam_c:
	qtc_paramCopy(defaultQtcStyle.density, tk.qtc);
	var ss=defaultQtcStyle.ft5;
	tk.qtc.textcolor=ss.textcolor;
	tk.qtc.fontsize=ss.fontsize;
	tk.qtc.fontfamily = ss.fontfamily;
	tk.qtc.fontbold = ss.fontbold;
	tk.qtc.forwardcolor=ss.forwardcolor;
	tk.qtc.reversecolor=ss.reversecolor;
	tk.qtc.mismatchcolor=ss.mismatchcolor;
	break;
case FT_qdecor_n:
	qtc_paramCopy(defaultQtcStyle.ft8, tk.qtc);
	break;
case FT_lr_c:
case FT_ld_c:
	qtc_paramCopy(defaultQtcStyle.interaction, tk.qtc);
	break;
case FT_cat_n:
	qtc_paramCopy(defaultQtcStyle.ft12, tk.qtc);
	break;
case FT_cat_c:
	qtc_paramCopy(defaultQtcStyle.ft13, tk.qtc);
	break;
case FT_bigwighmtk_n:
case FT_bigwighmtk_c:
	qtc_paramCopy(defaultQtcStyle.ft3, tk.qtc);
	break;
case FT_matplot:
	tk.qtc.height=200;
	break;
case FT_cm_c:
	tk.qtc={height:50};
	break;
case FT_catmat:
	break;
case FT_qcats:
	tk.qtc={height:100};
	break;
default:
	fatalError('trying to assign default style but got unknown tk ft '+tk.ft);
}
}


Browser.prototype.makeTrackDisplayobj=function(name,ft)
{
/* create display object
unified for all types
registry object must already exist, no matter native or custom
make doms for display

TODO pwc, htest, bev?
*/
var oobj=this.genome.getTkregistryobj(name,ft);
if(!oobj) {
	print2console('Cannot make track, no registry object found for '+name,2);
	return null;
}
// tk obj to be returned
var obj={label:oobj.label};

/* recover display object from registry object
*/
obj.name=name;
obj.ft=ft;
if(oobj.group) {
	obj.group=oobj.group;
}
obj.md=[];
obj.attrlst=[];
obj.attrcolor=[];
if(oobj.md) {
	for(var i=0; i<oobj.md.length; i++) {
		if(!oobj.md[i]) continue;
		var s={};
		for(var t in oobj.md[i]) {
			s[t]=1;
		}
		obj.md[i]=s;
	}
}
if(oobj.normalize) {
	var s={};
	for(var k in oobj.normalize) {
		s[k]=oobj.normalize[k];
	}
	obj.normalize=s;
}

// decide where (ghm or under) this track should appear initially
if(ft==FT_matplot) {
	obj.where=1;
} else if(ft==FT_bam_n || ft==FT_bam_c || ft==FT_sam_n || ft==FT_sam_c) {
	obj.where=1;
} else if(ft==FT_ld_c || ft==FT_ld_n) {
	obj.where=2;
} else if((ft==FT_bed_n||ft==FT_bed_c||ft==FT_lr_n||ft==FT_lr_c||ft==FT_qdecor_n) || (name in this.genome.decorInfo)){
	obj.where=2;
} else {
	obj.where=1;
}

// initial mode, should make into track2Style
if(isHmtk(ft) || ft==FT_matplot || ft==FT_cm_c) {
	obj.mode=M_show;
} else if(ft==FT_ld_c || ft==FT_ld_n) {
	obj.mode=M_trihm;
} else {
	obj.mode=oobj.mode;
}

// always-on
obj.url=oobj.url;
obj.details=oobj.details;

// for weaving
if(oobj.cotton) {
	// cotton passed for custom track
	obj.cotton=oobj.cotton;
} else if(this.weaver && this.weaver.iscotton) {
	// won't get cotton from registry object of native track, need to detect by this method
	obj.cotton=this.genome.name;
}

// set internal md
var mdi=getmdidx_internal();
var a={};
a[FT2verbal[obj.ft]]=1;
if(obj.ft==FT_weaver_c) {
	a[obj.cotton]=1;
} else {
	a[this.genome.name]=1;
}
obj.md[mdi]=a;

// track canvas
var c = document.createElement('canvas');
c.height=c.width=1;
c.style.display='block';
c.tkname=name;
c.onmousemove=track_Mmove;
c.onmouseout=track_Mout;
c.oncontextmenu=menu_track_browser;
obj.canvas=c;
c.onclick=track_click;
if(obj.cotton) c.cotton=obj.cotton;

// mcm canvas (hidden in splinter)
c = document.createElement('canvas');
c.style.display = "block";
c.tkname=name;
c.width=c.height=1;
c.onmousedown=mcm_Mdown;
c.onmouseover=mcm_Mover;
c.onmousemove=mcm_tooltipmove;
c.onmouseout=mcm_Mout;
c.oncontextmenu=menu_track_mcm;
obj.atC = c;
if(obj.cotton) c.cotton=obj.cotton;

// header canvas (hidden in splinter)
c = document.createElement('canvas');
c.style.display = 'block';
c.width=c.height=1;
c.tkname=name;
c.oncontextmenu=menu_track_browser;
c.onmouseover=trackheader_Mover;
c.onmouseout=trackheader_Mout;
c.onmousedown=trackheader_MD;
obj.header=c;
if(obj.cotton) c.cotton=obj.cotton;

/* apply style
*/
obj.qtc={anglescale:1};
tk_applydefaultstyle(obj);

switch(ft) {
case FT_ld_n:
case FT_ld_c:
	obj.ld={hash:{},ticksize:5,topheight:100};
	break;
case FT_weaver_c:
	obj.weaver={};
	for(var n in oobj.weaver) {
		obj.weaver[n]=oobj.weaver[n];
	}
	if(oobj.reciprocal) {
		obj.reciprocal=oobj.reciprocal;
	}
	if(!obj.qtc.stackheight) {
		obj.qtc.stackheight=weavertkstackheight;
	}
	break;
case FT_matplot:
	if(!oobj.tracks) fatalError('.tracks missing from matplot registry object: '+name);
	obj.tracks=[];
	/* registry obj .tracks are only names
	when adding matplot by loading member tk anew, will only use name
	if making matplot from menu by combining existing member tk,
	must replace name with display obj of member tk
	*/
	for(var i=0; i<oobj.tracks.length; i++) {
		var _o=this.findTrack(oobj.tracks[i]);
		if(_o) {
			obj.tracks.push(_o);
		} else {
			obj.tracks.push(oobj.tracks[i]);
		}
	}
	obj.qtc.height=Math.min(150,30*obj.tracks.length);
	obj.qtc.thtype=scale_auto;
	break;
case FT_cm_c:
	if(!oobj.cm) fatalError('.cm missing from methylC registry object');
	var c=oobj.cm;
	if(!c.color) fatalError('.color missing from methylC registry object');
	if(!c.bg) fatalError('.bg missing from methylC registry object');
	var s={isfirst:true};
	for(var k in c.set) {
		s[k]=c.set[k];
	}
	obj.cm={set:s,
		combine:(c.combine==undefined?false:c.combine),
		combine_chg:(c.combine_chg==undefined?false:c.combine_chg),
		scale:(c.scale==undefined?false:c.scale),
		filter:(c.filter==undefined?0:c.filter),
		color:c.color,bg:c.bg};
	break;
case FT_catmat:
	obj.rowheight=oobj.rowheight;
	obj.rowcount=oobj.rowcount;
	obj.qtc.height=1+obj.rowheight*obj.rowcount;
	break;
}

/* override default style
*/
if(oobj.qtc) { qtc_paramCopy(oobj.qtc,obj.qtc); }

if(obj.qtc.defaultmode) {
	obj.defaultmode=obj.qtc.defaultmode;
	delete obj.qtc.defaultmode;
}

if(oobj.cateInfo) {
	obj.cateInfo={};
	cateInfo_copy(oobj.cateInfo, obj.cateInfo);
}
if(oobj.public) {obj.public=true;}
if(oobj.showscoreidx!=undefined) {
	obj.showscoreidx=oobj.showscoreidx;
	if(oobj.scorenamelst) {obj.scorenamelst=oobj.scorenamelst;}
	if(oobj.scorescalelst) {obj.scorescalelst=oobj.scorescalelst;}
	if(!obj.scorenamelst) fatalError('.scorenamelst missing');
	if(!obj.scorescalelst || obj.scorescalelst.length==0) {
		// this happens for native anno tracks
		obj.scorescalelst=[];
		for(var i=0; i<obj.scorenamelst.length; i++) {
			obj.scorescalelst.push({type:scale_auto});
		}
	}
}
if(oobj.queryUrl) {obj.queryUrl=oobj.queryUrl;}
if(oobj.mastertk) { obj.mastertk=this.findTrack(oobj.mastertk); }
if(oobj.issnp) {obj.issnp=true;}
if(oobj.dbsearch) {obj.dbsearch=true;}
if(oobj.querytrack) {
	obj.querytrack=oobj.querytrack;
	obj.querytrack.mode=tkdefaultMode(obj.querytrack);
}

if(oobj.horizontallines) {
	obj.horizontallines=oobj.horizontallines;
}
return obj;
}



Browser.prototype.trackdom2holder=function()
{
/* track dom elements (canvas or labels) insert to holder
*/
var inghmlst=[], outghmlst=[], hidden=[];
for(var i=0; i<this.tklst.length; i++) {
	var tk=this.tklst[i];
	if(tkishidden(tk)) {
		hidden.push(tk);
		continue;
	}
	if(tk.where==1) {
		inghmlst.push(tk);
		if(this.hmdiv && tk.canvas) this.hmdiv.appendChild(tk.canvas);
		if(this.mcm && tk.atC) {
			this.mcm.tkholder.appendChild(tk.atC);
			tk.atC.style.display='block';
		}
		if(this.hmheaderdiv && tk.header) this.hmheaderdiv.appendChild(tk.header);
	} else {
		outghmlst.push(tk);
		if(this.decordiv && tk.canvas) this.decordiv.appendChild(tk.canvas);
		if(tk.atC) tk.atC.style.display='none';
		if(this.decorheaderdiv && tk.header) this.decorheaderdiv.appendChild(tk.header);
	}
}
inghmlst=inghmlst.concat(outghmlst);
inghmlst=inghmlst.concat(hidden);
this.tklst=inghmlst;
this.trackHeightChanged();
}


function mergeStackdecor(sink, source, ft, direction, offsetShift)
{
/* if is sam file:
merge sink/source reads that have same id (make them a paired end)
else, if source item also exists in sink (tell by item id), skip
else, push it into sink

args:
- sink: array of bed items of "sink" region
- source: array of bed items of "source" region
- direction, offsetShift: from Browser.move

** beware **
if move left, need to shift sink box start using move.offsetShift
if move right, need to shift source box start using sink region length
*/
if(direction!='l' && direction!='r') fatalError("mergeStackdecor: move direction error");
if(direction == 'l') {
	// shift sink
	for(var i=0; i<sink.length; i++) {
		sink[i].boxstart += offsetShift;
	}
} else {
	// shift source
	for(var i=0; i<source.length; i++) {
		var t=source[i];
		if(!t.boxstart) {
			t.boxstart=offsetShift;
		} else {
			t.boxstart+=offsetShift;
		}
	}
}
var isSam=ft==FT_bam_n || ft==FT_bam_c;
// make lookup table for items in sink
var lookup = {}; // key: item id, val: item array
for(var i=0; i<sink.length; i++) {
	lookup[sink[i].id] = sink[i];
}
for(var i=0; i<source.length; i++) {
	var _item=lookup[source[i].id];
	if(_item) {
		if(isSam) {
			if(!_item.hasmate) {
				// the sink read is not paired yet
				sink.push(source[i]);
			}
		} else if(ft==FT_weaver_c) {
			delete _item.hsp;
			_item.genomealign=source[i].genomealign;
		}
	} else {
		sink.push(source[i]);
	}
}
}


function menu_multipleselect_cancel()
{
gflag.menu.bbj.multipleselect_cancel();
menu_hide();
}
Browser.prototype.multipleselect_cancel=function()
{
var bbj=this;
if(bbj.trunk) bbj=bbj.trunk;
for(var i=0; i<bbj.tklst.length; i++) {
	var t=bbj.tklst[i];
	t.menuselected=false;
	if(t.header) {
		t.header.style.backgroundColor='';
	}
}
gflag.menu.tklst=[];
}



function track_click(event)
{
var sbj=gflag.browser;
/* must escape the case of panning
.move.oldpos is set to old position when mousedown
*/
if(sbj.move.oldpos!=sbj.move.styleLeft) return;

var tk=sbj.findTrack(event.target.tkname,event.target.cotton);
if(event.shiftKey) {
	/* register selected ones in gflag.menu.tklst
	exit when done
	*/
	if(sbj.splinterTag) {
		sbj=sbj.trunk;
	}
	sbj.track_click_multiselect(tk.name,tk.cotton);
	return;
}
if(tk.cotton && tk.ft!=FT_weaver_c) {
	// this is cotton track, switch to cotton bbj
	sbj=sbj.weaver.q[tk.cotton];
}
var x=event.clientX,
	y=event.clientY;
var pos=absolutePosition(sbj.hmdiv.parentNode);
var hitpoint=sbj.sx2rcoord(x+document.body.scrollLeft-pos[0]-sbj.move.styleLeft,true);
if(!hitpoint) {
	return;
}
if(hitpoint.gap && tk.ft!=FT_weaver_c) {
	bubbleShow(x,y);
	bubble.says.innerHTML= '<div style="margin:10px;">'+sbj.tellsgap(hitpoint)+'</div>';
	return;
}
var result=sbj.gettkitem_cursor(tk,x,y);

bubbleShow(x+document.body.scrollLeft,y+document.body.scrollTop);
stripChild(bubble.says,0);

if(isNumerical(tk)) {
	dom_create('div',bubble.says,'margin:10px;color:white;').innerHTML='<div style="font-size:130%;padding-bottom:10px;">'+
		(tk.mode==M_den ?
			((isNaN(result)||result==0)?'No data':result+' item'+(result>1?'s':'')) :
			(isNaN(result)?'No data':'Score: '+result))+'</div>'+
		hitpoint.str;
	return;
}
if(tk.ft==FT_matplot) {
	var str=[];
	for(var i=0; i<tk.tracks.length; i++) {
		var _t=tk.tracks[i];
		var v=_t.data[hitpoint.rid][hitpoint.sid];
		if(!isNaN(v)) {
			v=sbj.track_normalize(_t,v);
			var q=_t.qtc;
			str.push('<tr><td class=squarecell style="background-color:rgb('+q.pr+','+q.pg+','+q.pb+')"></td><td valign=top>'+neatstr(v)+'</td><td style="font-size:70%;">'+_t.label+'</td></tr>');
		}
	}
	dom_create('div',bubble.says,'margin:10px;color:white;').innerHTML='<table style="margin:5px;color:white">'+
		str.join('')+'<tr><td colspan=3 style="padding-top:5px">'+hitpoint.str+'</td></tr></table>';
	return;
}
if(tk.ft==FT_cm_c) {
	bubble.says.innerHTML='<div style="margin:10px;">'+cmtk_detail(tk,hitpoint.rid,hitpoint.sid)+hitpoint.str+'</div>';
	return;
}

if(!result || result.length==0) {
	bubbleHide();
	return;
}
var _i=result;
if(Array.isArray(_i)) _i=result[0];
var currentcoord=sbj.regionLst[hitpoint.rid][0]+':'+_i.start+'-'+_i.stop+
	((_i.strand && _i.strand!='.') ? '&nbsp;&nbsp;&nbsp;<span style="font-size:150%">'+
		((_i.strand=='>'||_i.strand=='+')?'&raquo;':'&laquo;')+'</span>' : '')+
	'&nbsp;&nbsp;&nbsp;'+bp2neatstr(_i.stop-_i.start);

if(tk.ft==FT_ld_c||tk.ft==FT_ld_n) {
	var item2=tk.data_chiapet[result[4]][result[5]];
	var tmp=findSnp_ldtk(tk,result,item2);
	var rs1=tmp[0], rs2=tmp[1];
	var _rs1=tk.ld.hash[rs1];
	var _rs2=tk.ld.hash[rs2];
	var table=dom_create('table',bubble.says,'color:white;margin:10px');
	var td=table.insertRow(0).insertCell(0);
	// find ld item in tk.ld.data
	for(var i=0; i<tk.ld.data[_rs1.rid].length; i++) {
		var t=tk.ld.data[_rs1.rid][i];
		if(t.rs1==rs1 && t.rs2==rs2) {
			for(var j=0; j<t.scorelst.length; j++) {
				dom_addtext(td,tk.scorenamelst[j]+': ');
				dom_addtext(td,t.scorelst[j]+'&nbsp;&nbsp;&nbsp;');
			}
			break;
		}
	}
	if(!tk.querytrack) {
		// no track to query
		dom_addtext(td,'<br><br><a href='+literal_snpurl+rs1+' style="color:white" target=_blank>'+rs1+'</a>');
		dom_addtext(td,'<br><br><a href='+literal_snpurl+rs2+' style="color:white" target=_blank>'+rs2+'</a>');
		return;
	}
	bubble.sayajax.style.display='block';
	bubble.sayajax.innerHTML='Loading SNP info...';
	bubble.sayajax.style.maxHeight=30;
	sbj.ajax('dbName='+sbj.genome.name+'&runmode='+sbj.genome.defaultStuff.runmode+
		'&regionLst='+
		sbj.regionLst[_rs1.rid][0]+','+(_rs1.coord-1)+','+(_rs1.coord+1)+',1,'+
		sbj.regionLst[_rs2.rid][0]+','+(_rs2.coord-1)+','+(_rs2.coord+1)+',1'+
		'&startCoord='+(_rs1.coord-1)+
		'&stopCoord='+(_rs2.coord+1)+trackParam([tk.querytrack]),function(data){sbj.lditemclick_gotdata(data,tk,rs1,rs2);});
	return;
}
if(tk.ft==FT_lr_c||tk.ft==FT_lr_n) {
	var item;
	switch(tk.mode) {
	case M_arc:
		item=tk.data_chiapet[result[3]][result[4]];
		break;
	case M_trihm:
		item=tk.data_chiapet[result[4]][result[5]];
		break;
	default:
		item=result;
	}
	var d=dom_create('div',bubble.says,'margin:10px;color:white;line-height:1.5;');
	dom_addtext(d,'Interacting regions:');
	dom_create('br',d);
	if(item.hasmate) {
		// mate found
		var m1 = item.struct.L;
		var m2 = item.struct.R;
		var coord1=sbj.regionLst[m1.rid][0]+':'+m1.start+'-'+m1.stop;
		var coord2=sbj.regionLst[m2.rid][0]+':'+m2.start+'-'+m2.stop;
		dom_addtext(d,'left: '+coord1+'&nbsp;');
		var b=dom_addbutt(d,'show',function(){sbj.splinter_issuetrigger(coord1);});
		dom_create('br',d);
		dom_addtext(d,'right: '+coord2+'&nbsp;');
		b=dom_addbutt(d,'show',function(){sbj.splinter_issuetrigger(coord2);});
		dom_create('br',d);
		dom_addtext(d,'score: '+item.name);
	} else {
		// no mate, preliminary checking to make sure there's valid mate information
		if(item.name.indexOf(',')==-1 || item.name.indexOf(':')==-1 || item.name.indexOf('-')==-1) {
			bubbleHide();
			print2console('Unexpected contents. Is this a valid Long range interaction track?', 2);
			return;
		}
		var tt = item.name.split(',');
		var t2 = tt[0].split(':');
		var t3 = t2[1].split('-');
		dom_addtext(d,'current: '+currentcoord+'&nbsp;');
		var b=dom_addbutt(d,'show',function(){sbj.splinter_issuetrigger(currentcoord);});
		dom_create('br',d);
		dom_addtext(d,'remote: '+tt[0]+'&nbsp;');
		var b=dom_addbutt(d,'show',function(){sbj.splinter_issuetrigger(tt[0]);});
		dom_create('br',d);
		dom_addtext(d,'score: '+tt[1]);
	}
	return;
}
if(tk.ft==FT_bed_n||tk.ft==FT_bed_c||tk.ft==FT_anno_n||tk.ft==FT_anno_c) {
	var item=Array.isArray(result)?result[0]:result;
	if(gflag.allow_packhide_tkdata) {
		dom_addbutt(bubble.says,'HIDE THIS ITEM',function(){sbj.trackitem_delete(tk,item,hitpoint.rid);}).style.margin=10;
	}
	var table=dom_create('table',bubble.says,'color:white;');
	table.cellSpacing=10;
	var tr=table.insertRow(0);
	if(item.name) {
		// item.name is like NM_003930, item.name2 for skap2
		var td=tr.insertCell(0);
		td.style.font='italic bold 18px Georgia';
		td.innerHTML=item.name2?item.name2:item.name;
		td=tr.insertCell(-1);
		if(tk.queryUrl) {
			td.align='right';
			td.innerHTML= '<a href='+tk.queryUrl+item.name+' target=_blank style="color:white">'+item.name+'</a>';
		}
	}
	tr=table.insertRow(-1);
	var td=tr.insertCell(0);
	td.colSpan=2;
	td.innerHTML=currentcoord;
	if(item.category && tk.cateInfo) {
		tr=table.insertRow(-1);
		td=tr.insertCell(0);
		td.colSpan=2;
		var c=tk.cateInfo[item.category];
		td.innerHTML='<span class=squarecell style="padding:0px 8px;background-color:'+c[1]+';">&nbsp;</span> '+c[0];
	}
	if(item.desc) {
		tr=table.insertRow(-1);
		td=tr.insertCell(0);
		td.colSpan=2;
		td.style.width='300px';
		td.innerHTML=item.desc;
	}
	if(item.scorelst) {
		for(var i=0; i<item.scorelst.length; i++) {
			tr=table.insertRow(-1);
			if(tk.showscoreidx!=undefined) {
				if(tk.showscoreidx==i) {
					tr.style.backgroundColor='rgba(0,0,0,0.5)';
				}
			}
			td=tr.insertCell(0);
			td.style.fontStyle='italic';
			td.innerHTML=tk.scorenamelst?tk.scorenamelst[i]:'unidentified score';
			td=tr.insertCell(1);
			td.innerHTML=item.scorelst[i];
		}
	}
	if(item.struct) {
		var r=sbj.regionLst[hitpoint.rid];
		var curbstart, curbstop;
		var d=sbj.dspBoundary;
		if(r[8] && r[8].item.hsp.strand=='-') {
			curbstart=Math.max(item.start, hitpoint.rid==d.vstopr?d.vstopc:r[3]);
			curbstop =Math.min(item.stop, hitpoint.rid==d.vstartr?d.vstartc:r[4]);
		} else {
			curbstart=Math.max(item.start, hitpoint.rid==d.vstartr?d.vstartc:r[3]);
			curbstop =Math.min(item.stop, hitpoint.rid==d.vstopr?d.vstopc:r[4]);
		}
		if(curbstart<curbstop && (curbstart>item.start ||curbstop<item.stop)) {
			td=table.insertRow(-1).insertCell(0);
			td.colSpan=2;
			var c=dom_create('canvas',td);
			c.width=280;
			c.height=19;
			var ctx = c.getContext('2d');
			var pL = 10; // left/right padding
			var pH=3; // top/bottom padding
			var w = c.width-pL*2; // actual plotable width
			plotGene(ctx,'white','#858585',
				item,
				pL, pH, w, c.height-pH*2,
				item.start, item.stop,
				false);
			// highlight current region
			var sf = w/(item.stop-item.start);
			ctx.strokeStyle = 'yellow';
			ctx.strokeRect(pL+parseInt((curbstart-item.start)*sf)+0.5, 0.5, parseInt((curbstop-curbstart)*sf), c.height-1);
		}
		// show struct
		var slst=[];
		if(item.struct.thin) {
			for(var i=0; i<item.struct.thin.length; i++) {
				var a=item.struct.thin[i];
				slst.push([a[0],a[1],1]);
			}
		}
		if(item.struct.thick) {
			for(var i=0; i<item.struct.thick.length; i++) {
				var a=item.struct.thick[i];
				slst.push([a[0],a[1],2]);
			}
		}
		if(slst.length>1) {
			td=table.insertRow(-1).insertCell(0);
			td.colSpan=2;
			var _d=dom_create('div',td,'height:70px;overflow-Y:scroll;resize:vertical;margin:10px;padding-left:10px;border-style:solid;border-color:rgba(200,200,200,.4);border-width:1px 0px;');
			var t2=dom_create('table',_d,'color:white;');
			var tr2=t2.insertRow(0);
			var td2=tr2.insertCell(0);
			td2.colSpan=2;
			td2.style.fontSize='70%';
			td2.innerHTML=slst.length+' segments:';
			slst.sort(sort_struct);
			for(var i=0; i<slst.length; i++) {
				tr2=t2.insertRow(-1);
				td2=tr2.insertCell(0);
				td2.innerHTML= slst[i][2]==1 ? '&#9644;' : '&#9606;';
				td2=tr2.insertCell(1);
				td2.innerHTML=slst[i][0]+' - '+slst[i][1];
			}
		}
	}
	if(item.details) {
		tr=table.insertRow(-1);
		td=tr.insertCell(0);
		td.colSpan=2;
		var t2=dom_create('table',td,'color:white;font-size:70%;');
		for(var k in item.details) {
			tr=t2.insertRow(-1);
			td=tr.insertCell(0);
			td.style.fontStyle='italic';
			td.style.opacity=0.8;
			td.innerHTML=k;
			td=tr.insertCell(1);
			td.style.width='250px';
			td.innerHTML=item.details[k];
		}
	}
	if(item.sbstroke) {
		tr=table.insertRow(-1);
		td=tr.insertCell(0);
		td.colSpan=2;
		td.innerHTML='Highlighted base from start: ';
		for(var i=0; i<item.sbstroke.length; i++) {
			td.innerHTML+=item.sbstroke+' ';
		}
	}
	return;
}

if(tk.ft==FT_bam_n||tk.ft==FT_bam_c) {
	if(sbj.targetBypassQuerytk(tk)) {
		sbj=sbj.weaver.q[tk.cotton];
	}
	var item=result;
	bubble.says.innerHTML='<div style="margin:10px;color:white;">'+
		'name: '+item.id + '<br>('+item.bam.status+')<br><br>';
	bubble.sayajax.style.display='block';
	bubble.sayajax.innerHTML = "<br>Loading read alignment...<br>";
	bubble.sayajax.style.maxHeight=30;
	var rlst=[]; // list of regions for seq query
	if(item.hasmate) {
		var r=item.struct.L;
		var c=samread_seqregion(r.bam.cigar,r.start);
		for(var i=0; i<c.length; i++) {
			rlst.push(sbj.regionLst[r.rid][0]+','+c[i][0]+','+c[i][1]);
		}
		r=item.struct.R;
		c=samread_seqregion(r.bam.cigar,r.start);
		for(var i=0; i<c.length; i++) {
			rlst.push(sbj.regionLst[r.rid][0]+','+c[i][0]+','+c[i][1]);
		}
	} else {
		var c=samread_seqregion(item.bam.cigar,item.start);
		for(var i=0; i<c.length; i++) {
			rlst.push(sbj.regionLst[hitpoint.rid][0]+','+c[i][0]+','+c[i][1]);
		}
	}
	sbj.ajax('getChromseq=on&dbName='+sbj.genome.name+
		'&regionlst='+rlst.join(','),function(data){sbj.bamread2bubble(data,item);});
	return;
}
if(tk.ft==FT_cat_c||tk.ft==FT_cat_n) {
	dom_create('div',bubble.says,'margin:10px;color:white;').innerHTML='<div style="font-size:130%;padding-bottom:10px;">'+
		'<div class=squarecell style="display:inline-block;background-color:'+result[1]+'"></div> '+result[0]+'</div>'+
		hitpoint.str+'</div>';
	return;
}
if(tk.ft==FT_catmat || tk.ft==FT_qcats) {
	var q=result[0], cat=result[1];
	dom_create('div',bubble.says,'margin:10px;color:white;').innerHTML='<div style="font-size:130%;padding-bottom:10px;">'+
		'<div class=squarecell style="display:inline-block;background-color:'+cat[1]+'"></div> '+cat[0]+'</div>'+
		'<div style="font-size:120%">'+q+'</div>'+
		hitpoint.str+'</div>';
	return;
}
if(tk.ft==FT_weaver_c) {
	var h=result.hsp;
	var tmp=sbj.weaver_detail(
		x+document.body.scrollLeft-pos[0]-sbj.move.styleLeft,
		hitpoint,result,tk,bubble.says);
	if(tk.weaver.mode==W_fine) {
		var chewstart=tmp[0], chewstop=tmp[1];
		var totallen=result.hsp.targetseq.length;
		if(chewstart>0 || chewstop<totallen-1) {
			// tooltip shows a fraction of the entire alignment
			var table=tmp[2];
			var tr=table.insertRow(-1);
			tr.insertCell(0);
			var td=tr.insertCell(1);
			tr.insertCell(2);
			var canvas=dom_create('canvas',td,'margin-top:10px;');
			var w=(chewstop-chewstart)*9;
			canvas.width=w;
			canvas.height=40;
			var ctx=canvas.getContext('2d');
			ctx.fillStyle='white';
			ctx.fillRect(0,0,1,5);
			ctx.fillRect(w-1,0,1,5);
			var a=parseInt(chewstart*w/totallen)+.5,
				b=parseInt(chewstop*w/totallen)+.5;
			ctx.strokeStyle='white';
			ctx.moveTo(0,5);
			var y=20.5,h2=15;
			ctx.lineTo(a,y);
			ctx.moveTo(w-1,5);
			ctx.lineTo(b,y);
			ctx.lineTo(a,y);
			ctx.lineTo(a,y+h2);
			ctx.lineTo(b,y+h2);
			ctx.lineTo(b,y);
			ctx.stroke();
			ctx.fillStyle='rgba(255,255,255,.5)';
			ctx.fillRect(0,y+2,w,4);
			ctx.fillRect(0,y+8,w,4);
		}
		var d=dom_create('table',bubble.says,'margin:0px 10px 10px;color:white;');
		d.cellSpacing=5;
		tr=d.insertRow(0);
		tr.insertCell(0).innerHTML=sbj.genome.name;
		tr.insertCell(1).innerHTML=sbj.regionLst[h.targetrid][0]+':'+h.targetstart+'-'+h.targetstop;
		tr.insertCell(2).innerHTML=bp2neatstr(h.targetstop-h.targetstart);
		tr=d.insertRow(1);
		tr.insertCell(0).innerHTML=tk.cotton;
		tr.insertCell(1).innerHTML=h.querychr+':'+h.querystart+'-'+h.querystop;
		tr.insertCell(2).innerHTML=bp2neatstr(h.querystop-h.querystart);
	} else {
	}
	return;
}
fatalError('unknown ft: '+tk.ft);
}

Browser.prototype.track_click_multiselect=function(tkname,cotton)
{
/* must be called on a trunk
*/
var tk=this.findTrack(tkname,cotton);
if(!tk) {
	print2console(tkname+' went missing',2);
	return;
}
// refresh gflag.menu.tklst, use only selected
gflag.menu.tklst=[];
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if(t.menuselected) {
		// only preserve those that are real and selected
		gflag.menu.tklst.push(t);
	}
}
var isnew=true;
var tcn=tkname+cotton;
for(var i=0; i<gflag.menu.tklst.length; i++) {
	var t=gflag.menu.tklst[i];
	if(t.name+t.cotton==tcn) {
		// this track was selected, de-select it
		isnew=false;
		gflag.menu.tklst.splice(i,1);
		tk.header.style.backgroundColor='';
		tk.menuselected=false;
		break;
	}
}
if(isnew) {
	tk.menuselected=true;
	tk.header.style.backgroundColor='yellow';
	gflag.menu.tklst.push(tk);
}
}

Genome.prototype.customgenomeparam=function()
{
if(!this.iscustom) return '';
var lst=[];
for(var n in this.scaffold.len) {
	lst.push(n);
	lst.push(this.scaffold.len[n]);
}
return '&iscustomgenome=on&scaffoldlen='+lst.join(',');
}



Browser.prototype.ajax_addtracks=function(lst)
{
/* must provide tkobj, works for mixture of native/custom tracks
custom track might be un-registered
but if adding compound tracks, member tracks must be registered!
*/
if(lst.length==0) {return;}
var olst=[];
for(var i=0; i<lst.length; i++) {
	var o=lst[i];
	if(o.ft==undefined || !FT2verbal[o.ft]) {
		print2console('missing or wrong ft',2);
		continue;
	}
	if(o.ft==FT_cm_c) {
		if(!o.cm || !o.cm.set) {
			o=this.genome.hmtk[o.name];
			if(!o) {
				print2console('registry object missing for a cmtk',2);
				continue;
			}
		}
		for(var k in o.cm.set) {
			var n=o.cm.set[k];
			var t=this.genome.hmtk[n];
			if(!t) {
				print2console('registry object missing for cmtk member: '+k,2);
			} else {
				olst.push({name:n, url:t.url, ft:t.ft, label:t.label, mode:M_show, qtc:{}});
			}
		}
		/* this cmtk won't go into olst
		but upon ajax return it should be rebuilt
		push it to init param
		TODO should be like matplot
		*/
		if(!this.init_bbj_param) {this.init_bbj_param={cmtk:[]};}
		if(!this.init_bbj_param.cmtk) {this.init_bbj_param.cmtk=[];}
		this.init_bbj_param.cmtk.push(o);
		continue;
	} else if(o.ft==FT_matplot) {
		if(!o.tracks) {
			o=this.genome.hmtk[o.name];
			if(!o) {
				print2console('registry obj missing for matplot',2);
				continue;
			}
		}
		for(var j=0; j<o.tracks.length; j++) {
			var n=o.tracks[j];
			var t=this.genome.getTkregistryobj(n);
			if(!t) {
				print2console('matplot member missing: '+n,2);
			} else {
				var m=tkdefaultMode(t);
				if(m!=M_show) {m=M_den;}
				olst.push({name:n,url:t.url,ft:t.ft,label:t.label,mode:m,qtc:{}});
			}
		}
		this.tklst.push(this.makeTrackDisplayobj(o.name,o.ft));
		continue;
	}
	if(!o.mode) {
		o.mode=tkdefaultMode(o);
	}
	olst.push(o);
}
this.cloak();
this.shieldOn();
var bbj=this;
// allow custom genome
this.ajax(this.displayedRegionParamPrecise()+'&addtracks=on&'+
	'dbName='+this.genome.name+
	this.genome.customgenomeparam()+
	trackParam(olst),function(data){bbj.ajax_addtracks_cb(data);});
}

Browser.prototype.ajax_addtracks_cb=function(data)
{
if(!data) {
	print2console('server crashed, please refresh and start over',2);
	return;
}
var count=this.tklst.length;
this.jsonAddtracks(data);
if(count<this.tklst.length) {
	print2console('Tracks added',1);
}
this.unveil();
this.shieldOff();
this.ajax_loadbbjdata(this.init_bbj_param);
}

Browser.prototype.jsonAddtracks=function(data)
{
/* first, need to register those that are new customs */
if(data.brokenbeads) {
	print2console('Failed to load following tracks:',0);
	var lst=data.brokenbeads;
	for(var i=0; i<lst.length; i++) {
		var w='<span style="background-color:red;color:white;">&nbsp;'+FT2verbal[lst[i].ft]+'&nbsp;</span> '+
			(isCustom(lst[i].ft)?lst[i].url:'');
		print2console(w,2);
		var d=document.createElement('div');
		this.refreshcache_maketkhandle(d,lst[i]);
		alertbox_addmsg({text:w,refreshcachehandle:d});
	}
}
var lst=data.tkdatalst;
/* pre-process json data
*/
for(var i=0; i<lst.length; i++) {
	if(!lst[i].data) {
		// no data, wrong track
		print2console('Error adding '+FT2verbal[lst[i].ft]+' track "'+lst[i].label+'"',3);
		continue;
	}
	if(!isCustom(lst[i].ft)) continue;
	if(lst[i].name in this.genome.hmtk) continue;
	/* unregistered custtk, register it here
	what's the possibilities??
	*/
	this.genome.registerCustomtrack(lst[i]);
}
/* now all tracks should be registered, add them */
var tknamelst=this.jsonTrackdata(data);
for(var i=0; i<tknamelst.length; i++) {
	if(!tknamelst[i][1]) continue;
	// newly added tk
	var t=this.findTrack(tknamelst[i][0]);
	/*
	if(this.weaver && this.weaver.iscotton) {
		// cottonbbj adding a new track, must put to target
		this.weaver.target.tklst.push(t);
	}
	*/
	if(t.mastertk && t.mastertk.ft==FT_matplot) {
		// new tk belongs to matplot, assemble matplot
		var nlst=[];
		for(var j=0; j<t.mastertk.tracks.length; j++) {
			var o=t.mastertk.tracks[j];
			if(typeof(o)=='string') {
				nlst.push(this.findTrack(o));
			} else {
				nlst.push(o);
			}
		}
		t.mastertk.tracks=nlst;
	}
}

if(!this.init_bbj_param) {
	var someingroup=false;
	for(var i=0; i<tknamelst.length; i++) {
		if(this.findTrack(tknamelst[i][0]).group!=undefined) {
			someingroup=true;
			break;
		}
	}
	if(someingroup) {
		this.drawTrack_browser_all();
	} else {
		// nobody in group, only draw involved ones
		for(var i=0; i<tknamelst.length; i++) {
			var o=this.findTrack(tknamelst[i][0]);
			if(!o) continue;
			if(o.mastertk) {
				this.drawTrack_browser(o.mastertk);
			} else {
				this.stack_track(o,0);
				this.drawTrack_browser(o);
			}
		}
	}

	if(!this.weaver || !this.weaver.iscotton) {
		this.prepareMcm();
		this.drawMcm();
		this.trackHeightChanged();
	}

	var newlst=[]; // names of newly added tracks
	for(var i=0; i<tknamelst.length; i++) {
		if(tknamelst[i][1]) {
			newlst.push(tknamelst[i][0]);
		}
	}
	this.aftertkaddremove(newlst);
	if(this.trunk) {
		/* !!! this is a splinter, sync track style and order, no facet
		*/
		var nk=this.trunk;
		for(var i=0; i<this.tklst.length; i++) {
			var t0=this.tklst[i];
			if(tkishidden(t0)) continue;
			var t=nk.findTrack(t0.name);
			if(!t) {
				// might not be error because when deleting track from trunk
				print2console('track missing from trunk '+t0.label,2);
				continue;
			}
			qtc_paramCopy(t.qtc,t0.qtc);
		}
		var newlst=[];
		for(var i=0; i<nk.tklst.length; i++) {
			var t=nk.tklst[i];
			if(tkishidden(t)) continue;
			for(var j=0; j<this.tklst.length; j++) {
				var t2=this.tklst[j];
				if(t2.name==t.name) {
					t2.where=t.where;
					newlst.push(t2);
					this.tklst.splice(j,1);
					break;
				}
			}
		}
		this.tklst=newlst.concat(this.tklst);
		this.trackdom2holder();
	}
}

// add new cottontk to target, do this after tracks are rendered
if(this.weaver && this.weaver.iscotton) {
	var target=this.weaver.target;
	for(var i=0; i<tknamelst.length; i++) {
		if(!tknamelst[i][1]) continue;
		var t=this.findTrack(tknamelst[i][0]);
		target.tklst.push(t);
	}
	target.trackdom2holder();
	target.prepareMcm();
	target.drawMcm();
}

if(this.splinterTag) return;

var hassp=false;
for(var a in this.splinters) {hassp=true;break;}
if(!hassp) return;
// this is a trunk with splinters
var singtk=[], // singular tk
	cmtk=[];
for(var i=0; i<tknamelst.length; i++) {
	var t=this.findTrack(tknamelst[i][0]);
	if(t.ft==FT_cm_c) {
		for(var a in t.cm.set) {
			singtk.push(t.cm.set[a]);
		}
		cmtk.push(t);
	} else {
		singtk.push(t);
	}
}
// by adding cmtk for trunk, cmtk won't show up in tknamelst, but in .init_bbj_param
if(this.init_bbj_param && this.init_bbj_param.cmtk) {
	for(var i=0; i<this.init_bbj_param.cmtk.length; i++) {
		cmtk.push(this.init_bbj_param.cmtk[i]);
	}
}
for(var k in this.splinters) {
	var b=this.splinters[k];
	if(cmtk.length>0) {
		if(!b.init_bbj_param) b.init_bbj_param={};
		if(!b.init_bbj_param.cmtk) b.init_bbj_param.cmtk=[];
		for(var i=0; i<cmtk.length; i++) {
			b.init_bbj_param.cmtk.push(cmtk[i]);
		}
	}
	b.ajax_addtracks(singtk);
}
}


Browser.prototype.aftertkaddremove=function(namelst)
{
switch(gflag.menu.context) {
case 10:
	// clicked a grid cell, or a list cell
	this.facetclickedcell_remake();
	return;
case 9:
	facet_term_selectall();
	break;
case 23:
	tkkwsearch();
	break;
case 22:
	menu_custtk_showall();
	break;
case 1:
case 2:
	break;
}
if(namelst.length>0 && (!this.trunk)) {
	this.generateTrackselectionLayout();
}
}



Browser.prototype.jsonTrackdata=function(data)
{
/* parse track data from json object
will create display object if the track is new
handles *panning*
preprocessing of weaver hsp
do not render
*/
var lst=data.tkdatalst;
if(lst.length==0) return [];

var tknames=[];
var hasnewtk=false;
var weavertk=[];
for(var i=0; i<lst.length; i++) {
	if(!lst[i].data) continue;
	var obj=this.findTrack(lst[i].name);
	if(!obj) {
		obj=this.makeTrackDisplayobj(lst[i].name, lst[i].ft);
		this.tklst.push(obj);
		tknames.push([lst[i].name,true]);
		hasnewtk=true;
	} else {
		tknames.push([lst[i].name,false]);
	}

	/* a few attributes of display object need to be recovered from the json data object 
	e.g. decor track mode, long range track filtering scores
	TODO tidy up logic, obj should carry these attributes already, unless that's something changed by cgi
	*/
	if(!isHmtk(obj.ft)) {
		// decor track's stuff
		if('mode' in lst[i]) obj.mode=lst[i].mode;
		if(obj.ft==FT_lr_c) {
			if('pfilterscore' in lst[i]) obj.qtc.pfilterscore=lst[i].pfilterscore;
			if('nfilterscore' in lst[i]) obj.qtc.nfilterscore=lst[i].nfilterscore;
		}
	}
	// work out the data
	var dj=lst[i].data; // data from json
	if(isNumerical(obj) || isHmtk(obj.ft) || obj.ft==FT_catmat || obj.ft==FT_qcats) {
		// numerical or cat
		var smooth=(obj.qtc && obj.qtc.smooth);
		if(!this.move.direction) {
			if(smooth) {
				obj.data_raw=dj;
				if(!obj.data) {
					smooth_tkdata(obj);
				}
			} else {
				obj.data=dj;
			}
		} else {
			var v=smooth?obj.data_raw:obj.data;
			if(this.move.direction == 'l') {
				if(this.move.merge) {
					v[0] = dj[dj.length-1].concat(v[0]);
					dj.pop();
				}
				v = dj.concat(v);
			} else {
				if(this.move.merge) {
					var idx=v.length-1;
					v[idx] = v[idx].concat(dj[0]);
					dj.shift();
				}
				v = v.concat(dj);
			}
			if(smooth) {
				obj.data_raw=v;
			} else {
				obj.data=v;
			}
		}
		obj.skipped=undefined;
	} else if(obj.mode==M_thin || obj.mode==M_full || obj.mode==M_arc || obj.mode==M_trihm || obj.mode==M_bar) {
		// stack data
		var is_ld=obj.ft==FT_ld_c||obj.ft==FT_ld_n;
		if(!this.move.direction) {
			if(is_ld) {
				obj.ld.data=dj;
			} else {
				obj.data = dj;
			}
			if(lst[i].skipped==undefined) {
				obj.skipped=0;
			} else {
				obj.skipped=lst[i].skipped;
			}
		} else {
			if(is_ld) {
				// no need to do .boxstart offset shift
				if(this.move.direction == 'l') {
					if(this.move.merge) {
						mergeStackdecor(obj.ld.data[0], dj[dj.length-1],obj.ft,this.move.direction);
						dj.pop();
					}
					obj.ld.data= dj.concat(obj.ld.data);
				} else {
					if(this.move.merge) {
						mergeStackdecor(obj.ld.data[obj.ld.data.length-1], dj[0], obj.ft, this.move.direction);
						dj.shift();
					}
					obj.ld.data= obj.ld.data.concat(dj);
				}
			} else {
				if(this.move.direction == 'l') {
					if(this.move.merge) {
						mergeStackdecor(obj.data[0], dj[dj.length-1], obj.ft, this.move.direction, this.move.offsetShift);
						dj.pop();
					}
					obj.data = dj.concat(obj.data);
				} else {
					if(this.move.merge) {
						mergeStackdecor(obj.data[obj.data.length-1], dj[0], obj.ft, this.move.direction, this.move.offsetShift);
						dj.shift();
					}
					obj.data = obj.data.concat(dj);
				}
				if(lst[i].skipped!=undefined) {
					if(obj.skipped==undefined) obj.skipped=0;
					obj.skipped+=lst[i].skipped;
				}
			}
		}
	} else {
		fatalError('jsonTrackdata: unknown display mode');
	}
	if(obj.ft==FT_weaver_c) { weavertk.push(obj); }
}
// done making obj.data
if(weavertk.length>0) {
	/* weaving 
	sort out alignment data from weaver tk
	*/
	if(!this.move.direction) {
		// clear data, TODO don't clear when adding new weaver
		this.weaver.insert=[];
		for(var i=0; i<this.regionLst.length; i++) {
			this.weaver.insert.push({});
		}
	}
	var bpl=this.entire.atbplevel;
	for(var wid=0; wid<weavertk.length; wid++) {
		var wtk=weavertk[wid];
		var querygenome=wtk.cotton;
		if(!querygenome) fatalError('.cotton missing from weaver tk');
		if(!(querygenome in this.weaver.q)) fatalError(querygenome+' missing from browser.weaver');
		this.weaver.q[querygenome].weaver.track=wtk;

		for(var rid=0; rid<this.regionLst.length; rid++) {
			var thisregion=this.regionLst[rid];
			for(var aid=0; aid<wtk.data[rid].length; aid++) {
				// one alignment
				var item=wtk.data[rid][aid];
				if(item.hsp) {
					// moving, old item has got hsp
					continue;
				}
				var aln=item.genomealign;
				if(!aln) {
					print2console('.genomealign missing: '+wtk.label+' '+rid+' '+aid,2);
					continue;
				}
				/* hsp based on this alignment */
				var samestrand=aln.strand=='+'; // +/+ alignment
				var hsp={
					querystart:aln.start,
					querystop:aln.stop,
					querychr:aln.chr,
					strand:aln.strand,
					queryseq:aln.queryseq,
					targetseq:aln.targetseq,
					targetrid:rid,
					gap:{},
					insert:{},
					};
				delete item.genomealign;
				item.hsp=hsp;

				if(wtk.weaver.mode==W_rough) {
					// may detect cases without sequence
					hsp.targetstart=item.start;
					hsp.targetstop=item.stop;
					continue;
				}

				var chewid=0; // common idx to chew on target/query alignment
				var targetstart=item.start;
				// chew up alignment in front of region
				while(targetstart<thisregion[3]) {
					if(hsp.targetseq[chewid]!='-') {
						targetstart++;
					}
					if(hsp.queryseq[chewid]!='-') {
						if(samestrand) {
							hsp.querystart++;
						} else {
							hsp.querystop--;
						}
					}
					chewid++;
				}
				hsp.chew_start=chewid;
				hsp.targetstart=targetstart;
				if(samestrand) {
					// hsp stop awaits to be determined
					hsp.querystop=hsp.querystart;
				} else {
					// hsp start awaits
					hsp.querystart=hsp.querystop;
				}
				// chew up alignment in view range (according to target), detect gap on target/query
				hsp.targetstop=Math.min(item.stop,thisregion[4]);
				var targetcoord=targetstart,
					targetgapcount=0,
					querygapcount=0;
				while(targetcoord<hsp.targetstop) {
					if(hsp.targetseq[chewid]=='-') {
						targetgapcount++;
					} else {
						if(targetgapcount>0) {
							// gap opens on target, treat as insertion to query for this hsp
							// only gapwidth>1px will be considered
							if(targetcoord in this.weaver.insert[rid]) {
								this.weaver.insert[rid][targetcoord]=Math.max(this.weaver.insert[rid][targetcoord],targetgapcount);
							} else {
								this.weaver.insert[rid][targetcoord]=targetgapcount;
							}
							// register insert in hsp
							hsp.insert[targetcoord]=targetgapcount;
							targetgapcount=0;
						}
						targetcoord++;
					}
					if(hsp.queryseq[chewid]=='-') {
						querygapcount++;
					} else {
						if(querygapcount>0) {
							// treat as deletion from query, private to this query
							if(samestrand) {
								hsp.gap[hsp.querystop]=querygapcount;
							} else {
								hsp.gap[hsp.querystart]=querygapcount;
							}
							querygapcount=0;
						}
						if(samestrand) {
							hsp.querystop++;
						} else {
							hsp.querystart--;
						}
					}
					chewid++;
				}
				hsp.chew_stop=chewid;
			}
		}
		// done making hsp for this wtk
	}
	if(this.weaver.mode==W_fine) {
		// not changing summarysize but the entire onscreen span
		// don't do this for stitch
		var i=this.regionLst.length-1;
		this.entire.spnum = this.cumoffset(i,this.regionLst[i][4]);
		if(this.move.direction!='r') {
			// unless moving right, need to recalculate styleLeft, preserve existing vstart
			var d=this.dspBoundary;
			var x=this.cumoffset(d.vstartr,d.vstartc);
			if(!x) fatalError('lost vstartr after weaving');
			this.placeMovable(-parseInt(x));
		}
		this.updateDspBoundary();
	}
}
if(hasnewtk) {
	this.trackdom2holder();
}
return tknames;
}



/*** __track__ ends ***/





/** __weaver__ **/
/*
one sample:
show all parts on hg19, clickable buttons

click a button, assemble new reference
new reference as target, hg19 as query

db-free reference, but needs length of all scaffolds
comparison of many samples
*/

function weaver_custtk_example(g,gn,url)
{
return function(){
	var d=g.custtk.ui_weaver;
	d.input_name.value=gn;
	d.input_url.value=url;
}
}

Browser.prototype.stitch2hithsp=function(stitch, x)
{
// call from target, x pos is compared to hsp's query pos
var hits=[];
for(var i=0; i<stitch.lst.length; i++) {
	var hsp=stitch.lst[i];
	if(x>Math.min(hsp.q1,hsp.q2) && x<Math.max(hsp.q1,hsp.q2)) {
		var sf=hsp.strand=='+'? (x-hsp.q1)/(hsp.q2-hsp.q1) :
			(x-hsp.q2)/(hsp.q1-hsp.q2);
		hits.push([
			hsp.strand=='+' ? (hsp.t1+sf*(hsp.t2-hsp.t1)) : (hsp.t2-sf*(hsp.t2-hsp.t1)),
			hsp.t1,
			hsp.t2,
			this.regionLst[hsp.targetrid][0]+
				' '+parseInt(hsp.strand=='+'?(hsp.targetstart+sf*(hsp.targetstop-hsp.targetstart)):
				(hsp.targetstop-sf*(hsp.targetstop-hsp.targetstart))),
			]);
	}
}
return hits;
}

Browser.prototype.weaver_gotgap=function(rid,descending)
{
if(!this.weaver || !this.weaver.insert) return [];
var ins=this.weaver.insert[rid];
if(!ins) return [];
var lst=[];
for(var c in ins) lst.push(parseInt(c));
if(lst.length==0) return [];
lst.sort( descending? numSort2 : numSort);
return lst;
}

Browser.prototype.targetBypassQuerytk=function(t)
{
if(!this.weaver) return false;
if(this.weaver.iscotton) {
	// cottonbbj
	return false;
}
// target bbj
if(t.cotton && t.ft!=FT_weaver_c) return true;
return false;
}


Browser.prototype.weaver_detail=function(x,hitpoint,result,tk,holder)
{
stripChild(holder,0);
if(tk.weaver.mode==W_rough) {
	var s=result.stitch;
	if(!s) return;
	var d=dom_create('div',holder,'margin:10px;line-height:1.5;');
	d.innerHTML=
		'Entire '+tk.cotton+' region:<br>'+
		s.chr+':'+s.start+'-'+s.stop+' ('+
		bp2neatstr(s.stop-s.start)+')'+
		(s.lst.length>1?'<br>Joined by '+s.lst.length+' alignments.':'')+
		'<div style="opacity:.8;font-size:80%;">Coordinates in the flags are approximate<br>because gaps are not considered.<br>ZOOM IN to view detailed alignment.</div>';
	return;
}
var item=result;
// determine chew start
var a=x-item.hsp.canvasstart;
var spsize=this.regionLst[hitpoint.rid][7];
var chewstart=item.hsp.chew_start+ parseInt(this.entire.atbplevel? a/this.entire.bpwidth : a*spsize);
var chewflank=10+Math.min(15,this.entire.atbplevel?0:parseInt(spsize));
var targetbp=[],querybp=[],aln=[];
var fv=item.hsp.strand=='+';
var targetcoord=item.hsp.targetstart,
	querycoord=fv?item.hsp.querystart:item.hsp.querystop;
for(var i=item.hsp.chew_start; i<Math.max(item.hsp.chew_start,chewstart-chewflank); i++) {
	if(item.hsp.targetseq[i]!='-') targetcoord++;
	if(item.hsp.queryseq[i]!='-') querycoord+=fv?1:-1;
}
var chewrealstart=i;
var targetstart=targetcoord;
var querystart, querystop,
	tchl=[], qchl=[]; // t/q highlight coord
if(fv) querystart=querycoord;
else querystop=querycoord;
for(; i<Math.min(item.hsp.targetseq.length,chewstart+chewflank); i++) {
	var t=item.hsp.targetseq[i],
		q=item.hsp.queryseq[i];
	if(t!='-' && q!='-' && (t.toLowerCase()==q.toLowerCase())) {
		aln.push('|');
	} else {
		aln.push('&nbsp;');
	}
	// only highlight those in summary point
	var highlight=this.entire.atbplevel ? (i==chewstart) : (i>=chewstart-spsize/2 && i<=chewstart+spsize/2);
	targetbp.push(highlight?'<span style="background-color:rgba(255,255,0,.2);">'+t+'</span>':t);
	querybp.push(highlight?'<span style="background-color:rgba(255,255,0,.2);">'+q+'</span>':q);
	if(highlight) {
		tchl.push(targetcoord);
		qchl.push(querycoord);
	}
	if(t!='-') targetcoord++;
	if(q!='-') querycoord+=fv?1:-1;
}
var chewrealstop=i;
if(fv) querystop=querycoord;
else querystart=querycoord;

var table=dom_create('table',holder,'margin:10px;color:white;');
// row 1
var tr=table.insertRow(0);
var td=tr.insertCell(0);
td.colSpan=3;
td.style.paddingBottom=10;
// target highlight coord
var max=min=tchl[0];
for(var i=1; i<tchl.length; i++) {
	var a=tchl[i];
	if(a>max) max=a;
	if(a<min) min=a;
}
td.innerHTML=this.genome.name+', '+this.regionLst[hitpoint.rid][0]+'&nbsp;&nbsp;'+
	'<span style="background-color:rgba(255,255,0,.2);">'+
	(max==min?max:min+'-'+max)+'</span>';
// row 2
tr=table.insertRow(-1);
td=tr.insertCell(0);
td.style.opacity=.7;
td.innerHTML=targetstart;
td=tr.insertCell(1);
td.style.font='15px Courier,monospace';
td.innerHTML=targetbp.join('');
td=tr.insertCell(2);
td.style.opacity=.7;
td.innerHTML=targetcoord;
// row 3
tr=table.insertRow(-1);
tr.insertCell(0);
td=tr.insertCell(1);
td.style.font='15px Courier,monospace';
td.innerHTML=aln.join('');
tr.insertCell(2);
// row 4
tr=table.insertRow(-1);
td=tr.insertCell(0);
td.style.opacity=.7;
td.innerHTML=fv?querystart:querystop;
td=tr.insertCell(1);
td.style.font='15px Courier,monospace';
td.innerHTML=querybp.join('');
td=tr.insertCell(2);
td.style.opacity=.7;
td.innerHTML=fv?querystop:querystart;
// row 5
tr=table.insertRow(-1);
td=tr.insertCell(0);
td.colSpan=3;
td.style.paddingTop=10;
// target highlight coord
var max=min=qchl[0];
for(var i=1; i<qchl.length; i++) {
	var a=qchl[i];
	if(a>max) max=a;
	if(a<min) min=a;
}
td.innerHTML=tk.cotton+', '+item.hsp.querychr+'&nbsp;&nbsp;'+
	'<span style="background-color:rgba(255,255,0,.2);">'+
	(max==min?max:(fv?min+'-'+max:max+'-'+min))+'</span>&nbsp;&nbsp;'+
	'<span style="opacity:.7;">'+(item.hsp.strand=='+'?'forward':'reverse')+'</span>';
return [chewrealstart,chewrealstop,table];
}

Browser.prototype.weaver_stitch=function(tk,stitchlimit)
{
/* stitch hsp up
distance constrain, if hsp are within a short distance of each other, merge into a big one
*/
stitchlimit=stitchlimit?stitchlimit:200*this.entire.summarySize;
var tmp=[]; // {chr:, lst:[]}
for(var rid=this.dspBoundary.vstartr; rid<=this.dspBoundary.vstopr; rid++) {
	for(var aid=0; aid<tk.data[rid].length; aid++) {
		var h0=tk.data[rid][aid].hsp;
		/* if hsp crosses view range border, will trim it
		but should not modify original hsp, make duplicate
		*/
		var h={};
		for(var n in h0) {
			h[n]=h0[n];
		}
		if(rid==this.dspBoundary.vstartr) {
			if(h.targetstop<=this.dspBoundary.vstartc) continue;
			if(h.targetstart<this.dspBoundary.vstartc) {
				var perc=(this.dspBoundary.vstartc-h.targetstart)/(h.targetstop-h.targetstart);
				h.targetstart=this.dspBoundary.vstartc;
				if(h.strand=='+') {
					h.querystart+=parseInt((h.querystop-h.querystart)*perc);
				} else {
					h.querystop-=parseInt((h.querystop-h.querystart)*perc);
				}
			}
		}
		if(rid==this.dspBoundary.vstopr) {
			if(h.targetstart>=this.dspBoundary.vstopc) continue;
			if(h.targetstop>this.dspBoundary.vstopc) {
				var perc=(h.targetstop-this.dspBoundary.vstopc)/(h.targetstop-h.targetstart);
				h.targetstop=this.dspBoundary.vstopc;
				if(h.strand=='+') {
					h.querystop-=parseInt((h.querystop-h.querystart)*perc);
				} else {
					h.querystart+=parseInt((h.querystop-h.querystart)*perc);
				}
			}
		}
		// save
		h.t1=this.cumoffset(h.targetrid,Math.max(this.regionLst[h.targetrid][3],h.targetstart));
		h.t2=this.cumoffset(h.targetrid,Math.min(this.regionLst[h.targetrid][4],h.targetstop));
		var nf=true;
		for(var i=0; i<tmp.length; i++) {
			if(tmp[i].chr==h.querychr) {
				tmp[i].lst.push(h);
				nf=false;
				break;
			}
		}
		if(nf) {
			tmp.push({chr:h.querychr,lst:[h]});
		}
	}
}
var newlst=[];
for(var j=0; j<tmp.length; j++) {
	tmp[j].lst.sort(hspSort);
	var fragment=null;
	for(var i=0; i<tmp[j].lst.length; i++) {
		var hsp=tmp[j].lst[i];
		if(!fragment) {
			fragment={
				chr:tmp[j].chr,
				start:hsp.querystart,
				stop:hsp.querystop,
				lst:[hsp],
				t1:hsp.t1,
				t2:hsp.t2,
			};
		} else {
			if(Math.max(fragment.start,hsp.querystart)-Math.min(fragment.stop,hsp.querystop) < stitchlimit) {
				// join
				fragment.lst.push(hsp);
				fragment.start=Math.min(fragment.start,hsp.querystart);
				fragment.stop=Math.max(fragment.stop,hsp.querystop);
				fragment.t1=Math.min(hsp.t1,fragment.t1);
				fragment.t2=Math.max(hsp.t2,fragment.t2);
			} else {
				newlst.push(fragment);
				fragment={
					chr:tmp[j].chr,
					start:hsp.querystart,
					stop:hsp.querystop,
					lst:[hsp],
					t1:hsp.t1,
					t2:hsp.t2,
				};
			}
		}
	}
	if(fragment) {
		newlst.push(fragment);
	}
}
tk.weaver.stitch=newlst;
}


Browser.prototype.weaver_stitch2cotton=function(tk)
{
var querybbj=this.weaver.q[tk.cotton];
if(this.weaverpending) {
	var p= this.weaverpending[tk.cotton];
	if(p) {
		querybbj.init_bbj_param={hubjsoncontent:p};
		delete this.weaverpending[tk.cotton];
	}
}
var regionlst=[];
var insertlst=[];
for(var j=0; j<tk.weaver.stitch.length; j++) {
	var stp=tk.weaver.stitch[j];
	var firsthsp=stp.lst[0];
	var newregion=[
		stp.chr,
		stp.start,
		stp.stop,
		stp.start,
		stp.stop,
		Math.ceil(stp.canvasstop-stp.canvasstart), // region screen width
		'',
		(stp.stop-stp.start)/(stp.canvasstop-stp.canvasstart),
		{
			canvasxoffset:stp.canvasstart,
			item:{hsp:{
				targetrid:firsthsp.targetrid,
				targetstart:firsthsp.targetstart,
				strand:'+'}},
			stitch:stp,
		}
	];
	regionlst.push(newregion);
	insertlst.push({});
}
querybbj.regionLst=regionlst;
querybbj.weaver.insert=insertlst;
this.weaver_cotton_spin(querybbj);
}


Browser.prototype.weaver_hsp2cotton=function(tk)
{
// call from target bbj
var qgn=tk.cotton;
var querybbj=this.weaver.q[qgn];
if(this.weaverpending) {
	var p= this.weaverpending[qgn];
	if(p) {
		querybbj.init_bbj_param={hubjsoncontent:p};
		delete this.weaverpending[qgn];
	}
}
var regionlst=[];
var insertlst=[];
for(var j=0; j<tk.data.length; j++) {
	for(var k=0; k<tk.data[j].length; k++) {
		var item=tk.data[j][k];
		var x1=item.boxstart,
			x2=item.boxstart+item.boxwidth;
		if(x2<=x1+5) continue;
		if(Math.max(x1,-this.move.styleLeft)>=Math.min(x2,this.hmSpan-this.move.styleLeft)) continue;
		// acceptable hsp, create a new region for it in query genome
		var r7= this.regionLst[item.hsp.targetrid][7];
		var newregion=[
			item.hsp.querychr,
			item.hsp.querystart,
			item.hsp.querystop,
			item.hsp.querystart,
			item.hsp.querystop,
			/* region screen width
			but this is inprecise since no gaps on query is considered
			*/
			this.entire.atbplevel?
				parseInt(this.entire.bpwidth*(item.hsp.querystop-item.hsp.querystart)) :
				parseInt((item.hsp.querystop-item.hsp.querystart)/r7),
			'',
			r7,
			{
				item:item,
			}];
		regionlst.push(newregion);
		var insert={};
		for(var c in item.hsp.gap) {
			insert[c]=item.hsp.gap[c];
		}
		insertlst.push(insert);
	}
}
// fit regionlst into querybbj
querybbj.regionLst=regionlst;
querybbj.weaver.insert=insertlst;
}

Browser.prototype.weaver_cotton_dspboundary=function()
{
// cottonbbj dspBoundary, use with care!
var r0=this.regionLst[0],
	r9=this.regionLst[this.regionLst.length-1];
this.dspBoundary={
	vstartr:0,
	vstarts:0,
	vstartc:r0[8].item.hsp.strand=='+'?r0[3]:r0[4],
	vstopr:this.regionLst.length-1,
	vstops:r9[5],
	vstopc:r9[8].item.hsp.strand=='+'?r9[4]:r9[3]
};
if(r0[8].canvasxoffset<-this.move.styleLeft) {
	// vstart in hsp
	var x=this.sx2rcoord(-this.move.styleLeft);
	if(x) {
		this.dspBoundary.vstartc=parseInt(x.coord);
		this.dspBoundary.vstarts=x.sid;
	}
}
if(r9[8].canvasxoffset+r9[5]>this.hmSpan-this.move.styleLeft) {
	// vstop in hsp
	var x=this.sx2rcoord(this.hmSpan-this.move.styleLeft);
	if(x) {
		this.dspBoundary.vstopc=parseInt(x.coord);
		this.dspBoundary.vstops=x.sid;
	}
}
}

Browser.prototype.weaver_cotton_spin=function(bbj)
{
// arg is cottonbbj
if(bbj.tklst.length==0 && !bbj.init_bbj_param) return;

if(bbj.regionLst.length==0) {
	// clear data for cotton tracks?
	for(var j=0; j<bbj.tklst.length; j++) {
		bbj.tklst[j].data=[];
	}
	bbj.drawTrack_browser_all();
	return;
}
bbj.weaver_cotton_dspboundary();

this.cloak();
if(bbj.init_bbj_param) {
	// loading cotton tracks for first time
	bbj.ajax_loadbbjdata(bbj.init_bbj_param);
} else {
	var param=[],a,b;
	for(var j=0; j<bbj.regionLst.length; j++) {
		var r=bbj.regionLst[j];
		param.push(r[0]+','+r[3]+','+r[4]+','+
			(this.entire.atbplevel?(r[4]-r[3]):r[5]));
		if(j==0) a=r[3];
		if(j==bbj.regionLst.length-1) b=r[4];
	}
	for(var i=0; i<bbj.tklst.length; i++) {
		var tc=bbj.tklst[i].canvas;
		var ctx=tc.getContext('2d');
		ctx.font='8pt Sans-serif';
		var y=tc.height/2;
		var t='Loading data...';
		var w=ctx.measureText(t).width;
		var h=14;
		var x= this.hmSpan/2-this.move.styleLeft-w/2-20;
		ctx.fillStyle=colorCentral.background;
		ctx.fillRect(x,y-h/2,w+40,h)
		ctx.strokeStyle=colorCentral.foreground;
		ctx.strokeRect(x,y-h/2,w+40,h);
		ctx.fillStyle=colorCentral.foreground;
		ctx.fillText(t,x+20,y+4);
	}
	bbj.ajaxX('&runmode='+RM_genome+
		'&regionLst='+param.join(',')+
		'&startCoord='+a+'&stopCoord='+b);
}
}


Browser.prototype.weavertoggle=function(width)
{
if(!this.weaver) return;
if(this.weaver.iscotton) return; // cottonbbj does not deal with it
var lst=this.tklst;
if(width<this.hmSpan*W_togglethreshold) {
	this.weaver.mode=W_fine;
	for(var i=0; i<lst.length; i++) {
		var t=lst[i];
		if(t.ft==FT_weaver_c) {
			/*
			if(this.genome.iscustom || ((t.cotton in genome) && genome[t.cotton].iscustom)) {
				// either target or query genome is custom
				t.weaver.mode=W_rough;
				t.qtc.stackheight=fullStackHeight;
			} else {
			}
			*/
			t.weaver.mode=W_fine;
			t.qtc.stackheight=weavertkstackheight;
		}
	}
	for(var n in this.weaver.q) {
		this.weaver.q[n].weaver.mode=W_fine;
	}
	return;
}
// large view range, rough mode
this.weaver.mode=W_rough;
for(var i=0; i<lst.length; i++) {
	var t=lst[i];
	if(t.ft==FT_weaver_c) {
		t.weaver.mode=W_rough;
		t.qtc.stackheight=fullStackHeight;
	}
}
this.weaver.insert=[];
for(var n in this.weaver.q) {
	this.weaver.q[n].weaver.mode=W_rough;
}
}



Browser.prototype.weaver_stitch_decor=function(tk,targetlst,qpoint,qx1,qx2,qstr)
{
glasspane.style.display='block';
glasspane.width=this.hmSpan;
glasspane.height=tk.canvas.height-fullStackHeight;
glasspane.style.left=absolutePosition(this.hmdiv.parentNode)[0];
glasspane.style.top=absolutePosition(tk.canvas)[1];
var ctx=glasspane.getContext('2d');
ctx.font='10pt Arial';

ctx.fillStyle=weavertkcolor_target;
for(var i=0; i<targetlst.length; i++) {
	var targetpoint=targetlst[i][0],
		t1=targetlst[i][1],
		t2=targetlst[i][2],
		tstr=targetlst[i][3];
	ctx.fillStyle=weavertkcolor_target;
	if(t1>0 && t2>t1) {
		ctx.fillRect(t1+this.move.styleLeft, 3, t2-t1, 2);
	}
	var w=ctx.measureText(tstr).width;
	var y0=5, y1=8;
	var m=targetpoint + this.move.styleLeft;
	if(this.hmSpan-m>w+10) {
		ctx.beginPath();
		ctx.moveTo(m,y0);
		ctx.lineTo(m+4,y1);
		ctx.lineTo(m+w,y1);
		ctx.lineTo(m+w,y1+14);
		ctx.lineTo(m-10,y1+14);
		ctx.lineTo(m-10,y1);
		ctx.lineTo(m-4,y1);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle='white';
		ctx.fillText(tstr,m-3,y1+11);
	} else {
		ctx.beginPath();
		ctx.moveTo(m,y0);
		ctx.lineTo(m+4,y1);
		ctx.lineTo(m+10,y1);
		ctx.lineTo(m+10,y1+14);
		ctx.lineTo(m-w,y1+14);
		ctx.lineTo(m-w,y1);
		ctx.lineTo(m-4,y1);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle='white';
		ctx.fillText(tstr,m-w+4,y1+11);
	}
}
// stroke query
ctx.fillStyle=tk.qtc.bedcolor;
if(qx1>0 && qx2>0) {
	ctx.fillRect(qx1+this.move.styleLeft, glasspane.height-4, qx2-qx1, 2);
}
w=ctx.measureText(qstr).width;
y0=glasspane.height-4;
y1=y0-3;
var m=qpoint+this.move.styleLeft;
if(this.hmSpan-m>w+10) {
	ctx.beginPath();
	ctx.moveTo(m,y0);
	ctx.lineTo(m+4,y1);
	ctx.lineTo(m+w,y1);
	ctx.lineTo(m+w,y1-14);
	ctx.lineTo(m-10,y1-14);
	ctx.lineTo(m-10,y1);
	ctx.lineTo(m-4,y1);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle='white';
	ctx.fillText(qstr,m-3,y1-3);
} else {
	ctx.beginPath();
	ctx.moveTo(m,y0);
	ctx.lineTo(m+4,y1);
	ctx.lineTo(m+10,y1);
	ctx.lineTo(m+10,y1-14);
	ctx.lineTo(m-w,y1-14);
	ctx.lineTo(m-w,y1);
	ctx.lineTo(m-4,y1);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle='white';
	ctx.fillText(qstr,m-w+4,y1-3);
}
}

function weaver_flip()
{
var tk=gflag.menu.tklst[0];
if(tk.ft!=FT_weaver_c) fatalError('but is not weavertk');
var newtarget=tk.cotton;
var b=gflag.menu.bbj;
var oldtarget=b.genome.name;
menu_hide();
if(b.weaver.q[newtarget].regionLst.length==0) {
	print2console('Cannot use '+newtarget+' as target: no regions in view range',2);
	return;
}
// check this tk
if(!tk.reciprocal) {
	print2console('missing .reciprocal on calling tk',2);
	return;
}
if(!(b.genome.name in tk.reciprocal)) {
	print2console('missing '+oldtarget+' to '+newtarget+' genomealign track',2);
	return;
}
// check other wtk
for(var i=0; i<b.tklst.length; i++) {
	var t2=b.tklst[i];
	if(t2.ft==FT_weaver_c && t2.name!=tk.name) {
		if(!t2.reciprocal) {
			print2console('missing .reciprocal on '+t2.cotton,2);
			return;
		}
		if(!(newtarget in t2.reciprocal)) {
			print2console('missing '+t2.cotton+' to '+newtarget+' genomealign track',2);
			return;
		}
	}
}
// swap color
var a=weavertkcolor_target;
weavertkcolor_target=tk.qtc.bedcolor;

// assemble hub for flushing
var hub=[];

// wtk for old target
var wtk={
	type:FT2verbal[FT_weaver_c],
	url:tk.reciprocal[oldtarget],
	mode:'show',
	color:a,
	querygenome:oldtarget,
	reciprocal:{},
	tracks:[]
	};
wtk.reciprocal[newtarget]=tk.url;
// collect url of other weavertk as its reciprocal
for(var i=0; i<b.tklst.length; i++) {
	var t2=b.tklst[i];
	if(t2.ft!=FT_weaver_c || t2.name==tk.name) continue;
	wtk.reciprocal[t2.cotton]=t2.url;
}
var newtargetnative=[];
var nativelst=[];
// collect tracks from old target
for(var i=0; i<b.tklst.length; i++) {
	var t2=b.tklst[i];
	if(tkishidden(t2)) continue;
	if(t2.ft!=FT_weaver_c && t2.cotton==newtarget) {
		// cottontk, becoming free-standing in new target
		if(isCustom(t2.ft)) {
			hub.push(b.genome.replicatetk(t2));
		} else {
			newtargetnative.push(b.genome.replicatetk(t2));
		}
		continue;
	}
	if(b.targetBypassQuerytk(t2) || t2.ft==FT_weaver_c) continue;
	if(isCustom(t2.ft)) {
		wtk.tracks.push(b.genome.replicatetk(t2));
	} else {
		nativelst.push(b.genome.replicatetk(t2));
	}
}
if(nativelst.length>0) {
	wtk.tracks.push({type:'native_track',list:nativelst});
}
hub.push(wtk);
if(newtargetnative.length>0) {
	hub.push({type:'native_track',list:newtargetnative});
}

// collect wtk of other genomes
for(var i=0; i<b.tklst.length; i++) {
	var t2=b.tklst[i];
	if(t2.ft!=FT_weaver_c || t2.name==tk.name) continue;
	if(!(t2.cotton in tk.reciprocal)) {
		print2console('missing '+t2.cotton+' to '+newtarget+' genomealign track',2);
		return;
	}
	var oldurl=t2.url;
	var wtk={
		type:FT2verbal[FT_weaver_c],
		url:tk.reciprocal[t2.cotton],
		mode:'show',
		color:t2.qtc.bedcolor,
		querygenome:t2.cotton,
		tracks:[]
		};
	wtk.reciprocal=t2.reciprocal;
	var nativelst=[];
	var b2=b.weaver.q[t2.cotton];
	for(var j=0; j<b2.tklst.length; j++) {
		var t3=b2.tklst[j];
		if(isCustom(t3.ft)) {
			wtk.tracks.push(b.genome.replicatetk(t3));
		} else {
			nativelst.push(b.genome.replicatetk(t3));
		}
	}
	if(nativelst.length>0) {
		wtk.tracks.push({type:'native_track',list:nativelst});
	}
	hub.push(wtk);
}

// first clear custtk from other genomes
for(var i=0; i<b.tklst.length; i++) {
	var t2=b.tklst[i];
	if(t2.ft!=FT_weaver_c) continue;
	var g=genome[t2.cotton];
	for(var n in g.hmtk) {
		if(isCustom(g.hmtk[n].ft)) {
			delete g.hmtk[n];
		}
	}
}
b.cleanuphtmlholder();

b.init_bbj_param={
	hubjsoncontent:hub,
};
// view range
var b2=b.weaver.q[newtarget];
var r=null;
for(var i=0; i<b2.regionLst.length; i++) {
	var r2=b2.regionLst[i];
	var start=r2[3];
	var stop=r2[4];
	if(i==b2.dspBoundary.vstartr) {
		if(r2[8].item.hsp.strand=='+') {
			start=b2.dspBoundary.vstartc;
		} else {
			stop=b2.dspBoundary.vstartc;
		}
	}
	if(i==b2.dspBoundary.vstopr) {
		if(r2[8].item.hsp.strand=='+') {
			stop=b2.dspBoundary.vstopc;
		} else {
			start=b2.dspBoundary.vstopc;
		}
	}
	if(r) {
		if(r[0]!=r2[0]) {
			if(stop-start > r[2]-r[1]) {
				r=[r2[0],start,stop];
			}
		} else {
			r[1]=Math.min(r[1],start);
			r[2]=Math.max(r[2],stop);
		}
	} else {
		r=[r2[0],start,stop];
	}
}
b.init_bbj_param.coord_rawstring=r[0]+':'+r[1]+'-'+r[2];
b.genome=b2.genome;
if(showgenomelogo) {
	showgenomelogo(b.genome.name,true);
}
/* must reset genome and weaver
*/
b.weaver.q={}; 
b.regionLst=[];

b.ajax_loadbbjdata(b.init_bbj_param);
}

function weaver_showgenometk_closure(gn)
{
return function(){weaver_showgenometk(gn);};
}

function weaver_showgenometk(gn)
{
menu_shutup();
menu.grandadd.style.display='block';
var tbj=gflag.menu.bbj;
var cbj=tbj.weaver.q[gn];
if(cbj.regionLst.length==0 || !cbj.regionLst[0][8]) {
	// init cottonbbj region
	if(tbj.weaver.mode==W_rough) {
		tbj.weaver_stitch2cotton(cbj.weaver.track);
	} else {
		tbj.weaver_hsp2cotton(cbj.weaver.track);
		// beware! r[8] xoffset is not set!
		for(var i=0; i<cbj.regionLst.length; i++) {
			var r=cbj.regionLst[i];
			r[8].canvasxoffset=r[8].item.hsp.canvasstart;
		}
	}
}
if(cbj.dspBoundary.vstartr==undefined) {
	cbj.weaver_cotton_dspboundary();
}
cbj.grandshowtrack();
}

function stitchblob_insertright(blob,i,stp,w,xspacer)
{
var mark=blob[i][1];
var markright=9999;
for(var j=0; j<blob.length; j++) {
	if(j!=i) {
		if(blob[j][0]>mark) {
			markright=Math.min(markright,blob[j][0]);
		}
	}
}
if(markright-mark>=w+xspacer) {
	stp.canvasstart=mark+xspacer;
	stp.canvasstop=stp.canvasstart+w;
	blob[i][1]=stp.canvasstop;
	return;
}
// add to last
mark=0;
for(var i=0; i<blob.length; i++) {
	mark=Math.max(blob[i][1],mark);
}
stp.canvasstart=mark+xspacer;
stp.canvasstop=stp.canvasstart+w;
stitchblob_new(blob,stp);
}

function stitchblob_insertleft(blob,i,stp,w,xspacer)
{
var mark=blob[i][0];
var markleft=0;
for(var j=0; j<blob.length; j++) {
	if(j!=i) {
		if(blob[j][1]<mark) {
			markleft=Math.max(markleft,blob[j][1]);
		}
	}
}
if(mark-markleft>=w+xspacer) {
	stp.canvasstop=mark-xspacer;
	stp.canvasstart=stp.canvasstop-w;
	blob[i][0]=stp.canvasstart;
	return true;
}
return false;
}

function stitchblob_new(blob,stp)
{
for(var j=0; j<blob.length; j++) {
	if(Math.max(blob[j][0],stp.canvasstart)-Math.min(blob[j][1],stp.canvasstop) <= 10) {
		blob[j][0]=Math.min(blob[j][0],stp.canvasstart);
		blob[j][1]=Math.max(blob[j][1],stp.canvasstop);
		return;
	}
}
blob.push([stp.canvasstart,stp.canvasstop]);
}

function weaver_queryjumpui()
{
gflag.menu.bbj.weaver.q[gflag.menu.tklst[0].cotton].showjumpui({});
}

Browser.prototype.may_portcoord2target=function()
{
}
/** __weaver__ ends **/

/** __wvfind__ **/
function wvfind_view_toggle(event)
{
var b=event.target;
apps.wvfind.vertical=b.innerHTML=='vertical';
apps.wvfind.view_h.disabled=apps.wvfind.vertical?false:true;
apps.wvfind.view_v.disabled=apps.wvfind.vertical;
wvfind_showresult(apps.wvfind);
}
function makepanel_wvfind(p)
{
var d=make_controlpanel(p);
apps.wvfind={
	main:d,
	tklst:[],
	goldengenomes:{hg19:1,mm9:1},
	tracks:{},
	};
var ht=make_headertable(d.__contentdiv);
var d2=ht._h;
d2.style.textAlign='';
apps.wvfind.gsbutt=dom_addbutt(d2,'',wvfind_showgeneset);
apps.wvfind.gssays=dom_create('div',d2,'display:inline;padding:0px 15px;',{t:'no gene set chosen'});
dom_addtext(d2,'Compare with&nbsp;');
apps.wvfind.querynames=dom_addtext(d2,'');
apps.wvfind.submitbutt=dom_addbutt(d2,'Find orthologs',wvfind_apprun);
/*
dom_addtext(d2,'&nbsp;&nbsp;View');
apps.wvfind.view_h=dom_addbutt(d2,'horizontal',wvfind_view_toggle);
apps.wvfind.view_v=dom_addbutt(d2,'vertical',wvfind_view_toggle);
apps.wvfind.view_v.disabled=true;
dom_addtext(d2,'&nbsp;&nbsp;');
var b=dom_addbutt(d2,'Add track',wvfind_track_genomemenu);
b.style.display='none';
apps.wvfind.trackbutt=b;
*/
var b=dom_addbutt(d2,'Export',wvfind_export);
b.style.display='none';
apps.wvfind.textbutt=b;
var b=dom_addbutt(d2,'Compare epigenomes',wvfind_2golden);
b.style.display='none';
apps.wvfind.goldenbutt=b;
apps.wvfind.error=dom_create('div',ht._c,'display:none;',{c:'alertmsg',t:'No orthologs found for this gene/region set.'});
var d3=dom_create('div',ht._c,'width:750px;height:400px;overflow:scroll;resize:both;');
apps.wvfind.table=dom_create('table',d3);
}

function toggle31_1() { gflag.menu.bbj.toggle31();}
function toggle31_2() {gflag.browser.toggle31();}
Browser.prototype.toggle31=function()
{
apps.wvfind.shortcut.style.display='inline-block';
if(apps.wvfind.main.style.display=='none') {
	if(!this.weaver) {
		print2console('Cannot invoke app, not in genome-alignment mode.',2);
		return;
	}
	if(!this.weaver.q) fatalError('target.weaver.q missing');
	var lst=[];
	for(var n in this.weaver.q) {
		lst.push(n);
	}
	cloakPage();
	apps.wvfind.target=[this.genome.name,weavertkcolor_target];
	apps.wvfind.gsbutt.innerHTML='Choose '+this.genome.name+' gene set';
	apps.wvfind.querynames.innerHTML=lst.join(' and ')+'&nbsp;';
	panelFadein(apps.wvfind.main, 100+document.body.scrollLeft, 50+document.body.scrollTop);
	apps.wvfind.bbj=this;
} else {
	pagecloak.style.display="none";
	panelFadeout(apps.wvfind.main);
}
menu_hide();
}

function menu_gs2wvfind()
{
panelFadeout(apps.gsm.main);
toggle31_1();
wvfind_gs_chosen(menu.genesetIdx);
}
function wvfind_showgeneset(event)
{
menu_showgeneset(apps.wvfind.bbj,event.target,wvfind_choosegeneset);
}
function wvfind_choosegeneset(event)
{
wvfind_gs_chosen(event.target.idx);
menu_hide();
}
function wvfind_gs_chosen(idx)
{
var e=apps.wvfind.bbj.genome.geneset.lst[idx];
apps.wvfind.geneset=e;
stripChild(apps.wvfind.gssays,0);
dom_addtkentry(3,apps.wvfind.gssays,false,null,e.name);
//apps.wvfind.gssays.innerHTML=e.name+' ('+e.lst.length+' items)';
}
function wvfind_gs2lst(gs)
{
var lst=[];
for(var i=0; i<gs.length; i++) {
	var e=gs[i];
	var t={chr:e.c,start:e.a1,stop:e.b1,hit:{}};
	if(e.isgene) {
		t.isgene=true;
		t.name=e.name;
		t.struct=eval('('+JSON.stringify(e.struct)+')');
		t.strand=e.strand;
		t.genetrack=e.type;
	}
	lst.push(t);
}
lst.sort(gfSort_len);
return lst;
}
function wvfind_apprun()
{
if(!apps.wvfind.geneset) {
	print2console('Please select a gene set.',2);
	return;
}
apps.wvfind.tracks={};
apps.wvfind.goldenbutt.style.display=
//apps.wvfind.trackbutt.style.display=
apps.wvfind.textbutt.style.display='none';
stripChild(apps.wvfind.table,0);
apps.wvfind.rlst=wvfind_gs2lst(apps.wvfind.geneset.lst);
var bbj=apps.wvfind.bbj;
var wtks=[], oldmodes={};
for(var i=0; i<bbj.tklst.length; i++) {
	var t=bbj.tklst[i];
	if(t.ft==FT_weaver_c) {
		wtks.push(t);
		oldmodes[t.name]=t.weaver.mode;
		t.weaver.mode=W_rough;
	}
}
if(wtks.length==0) { fatalError('no weaver tk');}
apps.wvfind.submitbutt.disabled=true;
apps.wvfind.submitbutt.innerHTML='Running...';
bbj.wvfind_run(apps.wvfind.rlst,wtks,wvfind_app_cb);
for(var i=0; i<wtks.length; i++) {
	wtks[i].weaver.mode=oldmodes[wtks[i].name];
}
}

Browser.prototype.wvfind_run=function(rlst,wtks,callback)
{
var lst=[], a,b;
for(var i=0; i<rlst.length; i++) {
	var e=rlst[i];
	lst.push(e.chr+','+e.start+','+e.stop+','+1);
	if(i==0) {a=e.start;}
	if(i==rlst.length-1) {b=e.stop;}
}
var param='dbName='+this.genome.name+'&runmode='+RM_genome+'&regionLst='+lst.join(',')+
	'&startCoord='+a+'&stopCoord='+b;
var bbj=this;
this.ajax(param+'&'+trackParam(wtks),function(data){bbj.wvfind_run_cb(data,rlst,wtks,callback);});
}

Browser.prototype.wvfind_run_cb=function(data,rlst,wtks,callback)
{
// data is returned by cgi
if(!data || !data.tkdatalst || data.tkdatalst.length==0) {
	print2console('Server error!',2);
	callback();
	return;
}
var bb=new Browser();
var btk={weaver:{}};
var targetmaxlen=0;
for(var i=0; i<rlst.length; i++) {
	targetmaxlen=Math.max(targetmaxlen,rlst[i].stop-rlst[i].start);
}
var geneIter={}; // iteration object to retrieve query gene info over stitches
var maxstitch=0; // to give to callback
for(var i=0; i<data.tkdatalst.length; i++) {
	var wtk=data.tkdatalst[i];
	if(wtk.ft!=FT_weaver_c) {
		print2console('ft is not weaver',2);
		continue;
	}
	var t=null;
	for(var j=0; j<wtks.length; j++) {
		if(wtks[j].name==wtk.name) {
			t=wtks[j];
			break;
		}
	}
	if(!t) {fatalError('wtk is gone');}
	if(wtk.data.length!=rlst.length) {
		print2console('Error: inconsistant returned data for '+t.cotton,2);
		continue;
	}
	// find default gene track from query genome
	var qgtk=null;
	for(var n in genome[t.cotton].decorInfo) {
		var g=genome[t.cotton].decorInfo[n];
		if(g.isgene) {
			qgtk=g;
			break;
		}
	}
	for(var j=0; j<wtk.data.length; j++) {
		var targetr=rlst[j];
		var len=(targetr.stop-targetr.start);
		bb.dspBoundary={vstartr:0,vstarts:0,vstartc:targetr.start,
			vstopr:0,vstops:len,vstopc:targetr.stop};
		bb.regionLst=[[targetr.chr,0,this.genome.scaffold.len[targetr.chr],targetr.start,targetr.stop,len,'',1]];
		bb.entire={length:len,spnum:len,summarySize:1,atbplevel:false};
		btk.data=[[]];
		for(var k=0; k<wtk.data[j].length; k++) {
			var e=wtk.data[j][k]; // target coord
			var g=e.genomealign; // query coord
			btk.data[0].push({start:e.start,stop:e.stop,id:j,
				hsp:{querychr:g.chr,
					querystart:g.start,
					querystop:g.stop,
					strand:g.strand,
					targetrid:0,
					targetstart:e.start,
					targetstop:e.stop}
			});
		}
		bb.weaver_stitch(btk,Math.min(len*5,targetmaxlen*1.5));
		if(!btk.weaver.stitch || btk.weaver.stitch.length==0) {
			continue;
		}
		btk.weaver.stitch.sort(wvfind_sorthit);
		targetr.hit[t.cotton]=btk.weaver.stitch;
		for(var k=0; k<btk.weaver.stitch.length; k++) {
			var s=btk.weaver.stitch[k];
			var total=0;
			for(var m=0; m<s.lst.length; m++) {
				total+=s.lst[m].targetstop-s.lst[m].targetstart;
			}
			maxstitch=Math.max(maxstitch,total);
			s.percentage=Math.min(100,Math.ceil(100*total/(targetr.stop-targetr.start)));
		}
		if(targetr.isgene) {
			if(!geneIter[t.cotton]) { geneIter[t.cotton]={}; }
			var thisqgtk=null;
			if(targetr.genetrack in genome[t.cotton].decorInfo) {
				thisqgtk=genome[t.cotton].decorInfo[targetr.genetrack];
			} else {
				thisqgtk=qgtk;
			}
			if(thisqgtk) {
				if(!geneIter[t.cotton][thisqgtk.name]) {
					geneIter[t.cotton][thisqgtk.name]=[];
				}
				geneIter[t.cotton][thisqgtk.name].push(j);
			} else {
				print2console('gene track missing from '+t.cotton,2);
			}
		}
	}
}
this.wvfind_itergene(geneIter,rlst,callback);
}

Browser.prototype.wvfind_itergene=function(geneiter,rlst,callback)
{
for(var qgn in geneiter) {
	// query genome
	for(var gtkn in geneiter[qgn]) {
		// is gene track name of query genome
		var tk=genome[qgn].getTkregistryobj(gtkn);
		if(!tk) {
			print2console(qgn+' gene track '+gtkn+' went missing',2);
			delete geneiter[gn][gtkn];
			continue;
		}
		var idlst=geneiter[qgn][gtkn];
		var lst=[], a,b;
		for(var i=0; i<idlst.length; i++) {
			var stp=rlst[idlst[i]].hit[qgn][0];
			lst.push(stp.chr+','+stp.start+','+stp.stop+','+1);
			if(i==0) {a=stp.start;}
			if(i==idlst.length-1) {b=stp.stop;}
		}
		delete geneiter[qgn][gtkn];
		var bbj=this;
		var tk2=duplicateTkobj(tk);
		tk2.mode=M_full;
		this.ajax('dbName='+qgn+'&runmode='+RM_genome+'&regionLst='+lst.join(',')+
			'&startCoord='+a+'&stopCoord='+b+'&'+trackParam([tk2]),
			function(data){bbj.wvfind_itergene_cb(data,geneiter,qgn,idlst,rlst,callback);});
		return;
	}
}
callback(1);
}

Browser.prototype.wvfind_itergene_cb=function(data,geneiter,qgn,idlst,rlst,callback)
{
if(!data || !data.tkdatalst || data.tkdatalst.length==0) {
	print2console('server error!',2);
} else if(data.tkdatalst[0].data.length!=idlst.length) {
	print2console('expecting data over '+idlst.length+' regions but got '+data.tkdatalst[0].data.length,2);
} else {
	for(var i=0; i<idlst.length; i++) {
		var stp=rlst[idlst[i]].hit[qgn][0];
		// get longest query gene
		var qglst=data.tkdatalst[0].data[i];
		if(qglst.length==0) { continue; }
		var qgene=qglst[0];
		var maxlen=Math.min(stp.stop,qgene.stop)-Math.max(stp.start,qgene.start);
		for(var j=1; j<qglst.length; j++) {
			var b=qglst[j];
			var bl=Math.min(stp.stop,b.stop)-Math.max(stp.start,b.start);
			if(bl>maxlen) {
				maxlen=bl;
				qgene=b;
			}
		}
		stp.querygene=qgene;
	}
}
this.wvfind_itergene(geneiter,rlst,callback);
}

function wvfind_app_cb(maxbp)
{
apps.wvfind.submitbutt.disabled=false;
apps.wvfind.submitbutt.innerHTML='Find orthologs';
if(!maxbp) {
	apps.wvfind.error.style.display='block';
	return;
}
apps.wvfind.error.style.display='none';
var queries=[];
var bbj=apps.wvfind.bbj;
for(var n in bbj.weaver.q) {
	for(var i=0; i<bbj.tklst.length; i++) {
		var t=bbj.tklst[i];
		if(t.ft==FT_weaver_c && t.cotton==n) {
			queries.push([n,t.qtc.bedcolor]);
			break;
		}
	}
}
apps.wvfind.queries=queries;
wvfind_showresult(apps.wvfind);
apps.wvfind.textbutt.style.display='inline';
//apps.wvfind.trackbutt.style.display= 'inline';
if(bbj.genome.name in apps.wvfind.goldengenomes) {
	var all=true;
	for(var i=0; i<apps.wvfind.queries.length; i++) {
		if(!(apps.wvfind.queries[i][0] in apps.wvfind.goldengenomes)) {
			all=false;
		}
	}
	if(all) {
		apps.wvfind.goldenbutt.style.display='inline';
	}
}
}

function wvfind_showresult(arg)
{
if(!arg.queries || !arg.rlst) return;
var bbj=arg.bbj;
var bbjclb=bbj.regionLst.length>0;
stripChild(arg.table,0);
var tr=arg.table.insertRow(0);
var td=tr.insertCell(0);
td.align='center';
td.innerHTML=bbj.genome.name+(bbjclb?' <span style="font-size:70%">click to view in browser</span>':'');
for(var i=0; i<arg.queries.length; i++) {
	td=tr.insertCell(-1);
	td.align='center';
	td.style.color=arg.queries[i][1];
	td.innerHTML=arg.queries[i][0];
}
var lst=arg.rlst;
var width=300;
var maxtarget=0;
for(var i=0; i<lst.length; i++) {
	maxtarget=Math.max(lst[i].stop-lst[i].start,maxtarget);
}
var sf=150/maxtarget;
for(var i=0; i<lst.length; i++) {
	var e=lst[i];
	tr=arg.table.insertRow(-1);
	tr.className='clb4';
	td=tr.insertCell(0);
	td.vAlign='top';
	td.align='right';
	if(e.isgene) {
		var s=dom_addtext(td,e.name,weavertkcolor_target,bbjclb?'clb':null);
		if(bbjclb) {
			s.onclick=jump2coord_closure(bbj,e.chr,e.start,e.stop);
		}
	} else {
		var s=dom_addtext(td,e.chr+':'+e.start+'-'+e.stop+' <span style="font-size:70%">'+bp2neatstr(e.stop-e.start)+'</span>',weavertkcolor_target,'clb');
		if(bbjclb) {
			s.onclick=jump2coord_closure(bbj,e.chr,e.start,e.stop);
		}
	}
	if(arg.checkbox) {
		var chb=dom_create('input',td,'transform:scale(1.5);');
		chb.type='checkbox';
		e.checkbox=chb;
	}
	dom_create('div',td,'width:'+parseInt(100*(e.stop-e.start)/maxtarget)+'%;height:2px;background-color:'+weavertkcolor_target);
	if(e.isgene) {
		dom_create('div',td,'font-size:70%;').innerHTML=e.chr+':'+e.start+'-'+e.stop+', '+bp2neatstr(e.stop-e.start);
	}
	for(var j=0; j<arg.queries.length; j++) {
		td=tr.insertCell(-1);
		td.vAlign='top';
		td.style.paddingTop=5;
		var hits=e.hit[arg.queries[j][0]];
		if(!hits || hits.length==0) {
			td.innerHTML='no hit';
			continue;
		}
		var stc=hits[0];
		if(arg.checkbox) {
			if(stc.percentage>40) {
				e.checkbox.checked=true;
			}
		}
		var par={start:e.start,stop:e.stop,
			targetcolor:weavertkcolor_target,
			querycolor:arg.queries[j][1],
			stitch:stc,
			width:width,
			holder:td,};
		if(e.isgene) {
			par.targetstruct=e.struct;
			par.strand=e.strand;
		}
		draw_stitch(par);
		var d=dom_create('div',td);
		if(stc.querygene) {
			dom_addtext(d,
				stc.querygene.name2?stc.querygene.name2:stc.querygene.name,
				arg.queries[j][1]);
			dom_addtext(d,'&nbsp;&nbsp;'+stc.chr+':'+stc.start+'-'+stc.stop+', '+bp2neatstr(stc.stop-stc.start)+' '+stc.percentage+'% aligned').style.fontSize='70%';
		} else {
			dom_addtext(d,stc.chr+':'+stc.start+'-'+stc.stop+' <span style="font-size:70%">'+bp2neatstr(stc.stop-stc.start)+' '+stc.percentage+'% aligned</span>',arg.queries[j][1]);
		}
		if(hits.length>1) {
			var d2=dom_create('table',d,'display:none;zoom:.8;');
			for(var k=1; k<hits.length; k++) {
				var ss=hits[k];
				var tr2=d2.insertRow(-1);
				tr2.insertCell(0).innerHTML=ss.chr+':'+ss.start+'-'+ss.stop;
				tr2.insertCell(1).innerHTML=bp2neatstr(ss.stop-ss.start);
				tr2.insertCell(2).innerHTML=ss.percentage+'%';
			}
			dom_addtext(d,'&nbsp;&nbsp;'+(hits.length-1)+' more hit'+(hits.length-1>1?'s':''),null,'clb').onclick=toggle_prevnode;
		}
	}
}
}

function wvfind_sorthit(a,b)
{
var la=0;
for(var i=0; i<a.lst.length; i++) { la+=a.lst[i].targetstop-a.lst[i].targetstart; }
var lb=0;
for(var i=0; i<b.lst.length; i++) {lb+=b.lst[i].targetstop-b.lst[i].targetstart;}
return lb-la;
}

function draw_stitch(p)
{
var b1h=p.b1h?p.b1h:(p.targetstruct?11:5),
	b2h=p.b2h?p.b2h:(p.stitch.querygene?11:5),
	alnh=p.alnheight?p.alnheight:22;
var c=dom_create('canvas',p.holder);
c.width=p.width;
c.height=b1h+b2h+alnh+(p.allstitches?(p.allstitches.length-1)*(b2h+2):0);
var sf=p.width/Math.max(p.stop-p.start,p.stitch.stop-p.stitch.start);
var ctx=c.getContext('2d');
var w=sf*(p.stop-p.start);
if(p.targetstruct) {
	plotGene(ctx,p.targetcolor,'white',
		{start:p.start,stop:p.stop,strand:p.strand,struct:p.targetstruct},
		0, 0, w, b1h,
		p.start, p.stop,
		false);
} else {
	ctx.fillStyle=p.targetcolor;
	ctx.fillRect(0,0,w,b1h);
}
var stcw=sf*(p.stitch.stop-p.stitch.start);
ctx.fillStyle=p.querycolor;
if(p.stitch.querygene) {
	ctx.fillRect(0,b1h+alnh+parseInt(b2h/2),stcw,1)
	plotGene(ctx,p.querycolor,'white',
		p.stitch.querygene,
		0, b1h+alnh, stcw, b2h,
		p.stitch.start, p.stitch.stop,
		false);
} else {
	ctx.fillRect(0,b1h+alnh,stcw,b2h)
}
ctx.fillStyle='#858585';
for(var i=0; i<p.stitch.lst.length; i++) {
	var e=p.stitch.lst[i];
	var a1=(e.targetstart-p.start)*sf,
		a2=Math.max(a1+1,(e.targetstop-p.start)*sf),
		b1=(e.querystart-p.stitch.start)*sf,
		b2=Math.max(b1+1,(e.querystop-p.stitch.start)*sf);
	ctx.beginPath();
	ctx.moveTo(a1,b1h+1);
	ctx.lineTo(a2,b1h+1);
	var h2=b1h+alnh-1;
	if(e.strand=='+') {
		ctx.lineTo(b2,h2);
		ctx.lineTo(b1,h2);
	} else {
		ctx.lineTo(b1,h2);
		ctx.lineTo(b2,h2);
	}
	ctx.closePath();
	ctx.fill();
}
/*
if(p.allstitches) {
	ctx.fillStyle=p.querycolor;
	for(var i=1; i<p.allstitches.length; i++) {
		var e=p.allstitches[i];
		ctx.fillRect(0,b2h+alnh+(i-1)*(b1h+b2h),sf*(e.stop-e.start),b2h)
	}
}
*/
}

function wvfind_export()
{
var doc=window.open().document;
var table=doc.createElement('table');
doc.body.appendChild(table);
table.cellPadding=5;
table.border=1;
var tr=table.insertRow(0);
var td=tr.insertCell(0);
td.innerHTML=apps.wvfind.bbj.genome.name;
for(var i=0; i<apps.wvfind.queries.length; i++) {
	td=tr.insertCell(1);
	td.innerHTML=apps.wvfind.queries[i][0];
}
for(var i=0; i<apps.wvfind.rlst.length; i++) {
	var e=apps.wvfind.rlst[i];
	tr=table.insertRow(-1);
	td=tr.insertCell(0);
	td.innerHTML=(e.isgene?(e.name2?e.name2:e.name)+' ':'')+e.chr+':'+e.start+'-'+e.stop;
	for(var j=0; j<apps.wvfind.queries.length; j++) {
		var qn=apps.wvfind.queries[j][0];
		td=tr.insertCell(-1);
		if(qn in e.hit) {
			var e2=e.hit[qn][0];
			td.innerHTML=(e2.querygene?(e2.querygene.name2?e2.querygene.name2:e2.querygene.name)+' ':'')+e2.chr+':'+e2.start+'-'+e2.stop;
		}
	}
}
}
function wvfind_2golden()
{
var J={};
for(var n in apps.wvfind.goldengenomes) {
	J[n]={};
}
J[apps.wvfind.bbj.genome.name].wvfind={rlst:apps.wvfind.rlst,queries:apps.wvfind.queries};
apps.wvfind.goldenbutt.disabled=true;
ajaxPost('json\n'+JSON.stringify(J),function(key){wvfind_2golden_cb(key);});
}
function wvfind_2golden_cb(key)
{
apps.wvfind.goldenbutt.disabled=false;
if(!key) {
	print2console('Server error, please try again.',2);
	return;
}
window.open(window.location.origin+window.location.pathname+'roadmap/?pin='+window.location.origin+window.location.pathname+'t/'+key,'_blank');
}

function wvfind_track_genomemenu(event)
{
menu_blank();
menu_addoption(null,'Add '+apps.wvfind.bbj.genome.name+' track',wvfind_choosetk_closure(apps.wvfind.bbj.genome.name),menu.c32);
for(var i=0; i<apps.wvfind.queries.length; i++) {
	var n=apps.wvfind.queries[i][0];
	menu_addoption(null,'Add '+n+' track',wvfind_choosetk_closure(n),menu.c32);
}
menu_show_beneathdom(0,event.target);
}
function wvfind_choosetk_closure(gname) {return function(){wvfind_choosetk(gname);};}
function wvfind_choosetk(gname)
{
menu_blank();
dom_create('div',menu.c32,'margin:15px;').innerHTML=gname+' tracks';
var d=dom_create('div',menu.c32,'margin:15px;');
for(var i=0; i<apps.wvfind.bbj.tklst.length; i++) {
	var tk=apps.wvfind.bbj.tklst[i];
	if(tk.ft==FT_weaver_c) continue;
	if((!tk.cotton && apps.wvfind.bbj.genome.name==gname) || (tk.cotton && tk.cotton==gname)) {
		dom_addtkentry(2,d,false,tk,tk.label,wvfind_addtk_sukn);
	}
}
}
function wvfind_addtk_sukn(event)
{
event.target.className='tkentry_inactive';
var tk=event.target.tkobj;
var targetbbj=tk.cotton ? apps.wvfind.bbj.weaver.q[tk.cotton] : apps.wvfind.bbj;
var gn=tk.cotton?tk.cotton:apps.wvfind.bbj.genome.name;
if(gn in apps.wvfind.tracks && tk.name in apps.wvfind.tracks[gn]) {
	return;
}
targetbbj.wvfind_addtk(tk,apps.wvfind);
}
Browser.prototype.wvfind_addtk=function(tk,wvobj)
{
var tk2=null;
switch(tk.ft) {
case FT_bedgraph_c:
case FT_bedgraph_n:
case FT_bigwighmtk_c:
case FT_bigwighmtk_n:
case FT_qdecor_n:
case FT_cat_n:
case FT_cat_c:
	tk2=duplicateTkobj(tk);
	tk2.mode=M_show;
	break;
case FT_anno_n:
case FT_anno_c:
case FT_bed_n:
case FT_bed_c:
case FT_bam_n:
case FT_bam_c:
	tk2=duplicateTkobj(tk);
	tk2.mode=M_den;
	break;
default:
	print2console(FT2verbal[tk.ft]+' track is not supported at the moment',2);
	return;
}
var gn=this.genome.name;
if(!(gn in wvobj.tracks)) {
	wvobj.tracks[gn]={};
}
wvobj.tracks[gn][tk.name]=tk2;
// collect regions
var rlst=[];
for(var i=0; i<wvobj.rlst.length; i++) {
	var e=wvobj.rlst[0];
	if(gn==wvobj.target[0]) {
		rlst.push([e.chr,e.start,e.stop]);
	} else {
		var hits=e.hit[gn];
		// XXX
		if(hits && hits.length>0) {
		}
	}
}
}

/** __wvfind__ ends **/






/*** __md__ ***/

function getmdidx_internal()
{
for(var i=0; i<gflag.mdlst.length; i++) {
	if(gflag.mdlst[i].tag==literal_imd) return i;
}
return -1;
}


function parse_metadata_recursive(pterm, cterm, voc, obj)
{
/*
pterm: parent term, null for root
cterm: child term, must not be null
voc: vocabulary obj at the level of cterm, may be null
obj: ele in genome.mdlst
*/
if(pterm!=null) {
	// c2p
	if(cterm==pterm) {
		var msg='Metadata term "'+cterm+'" is removed as it cannot be both parent and child';
		print2console(msg,2);
		alertbox_addmsg({text:msg});
		return;
	}
	if(cterm in obj.c2p) {
		obj.c2p[cterm][pterm]=1;
	} else {
		var x={};
		x[pterm]=1;
		obj.c2p[cterm]=x;
	}
	// p2c
	if(pterm in obj.p2c) {
		obj.p2c[pterm][cterm]=1;
	} else {
		var x={};
		x[cterm]=1;
		obj.p2c[pterm]=x;
	}
}
if(voc==null) return;
if(Array.isArray(voc)) {
	// voc is list of leaf terms
	for(var i=0; i<voc.length; i++) {
		if(voc[i]==cterm) {
			var msg='Metadata term "'+voc[i]+'" is removed as it cannot be both parent and attribute';
			print2console(msg,2);
			alertbox_addmsg({text:msg});
			continue;
		}
		parse_metadata_recursive(cterm, voc[i], null, obj);
	}
} else {
	// voc is still an hash
	for(var cc in voc) {
		parse_metadata_recursive(cterm, cc, voc[cc], obj);
	}
}
}

Genome.prototype.invokemds=function(which, x, y)
{
this.mdselect.which = which;
menu_shutup();
menu.c55.style.display='block';
menu.c55.says.innerHTML='Metadata';
menu.c31.style.display='block';
menu.c57.style.display='block';
menu.c61.style.display='block';
menu.c61.firstChild.innerHTML='about metadata';
menu.c61.firstChild.onclick=function(){window.open(FT2noteurl.md)};
stripChild(menu.c31,0);
for(var i=0; i<gflag.mdlst.length; i++) {
	menu.c31.appendChild(gflag.mdlst[i].main);
}
if(menu.style.display!='block') {
	menu_show(0,x,y);
}
}


function mcmheader_mover(event)
{
/* mouse over mcm header canvas, must update gflag.browser
as this canvas stays outside bbj.main table
*/
var t=event.target;
while(t.tagName!='TABLE') t=t.parentNode;
gflag.browser=horcrux[t.horcrux];
}
function menu_mcm_invokemds() {gflag.menu.bbj.mcm_invokemds();};
function button_mcm_invokemds()
{
if(gflag.mdlst.length==0) {
	print2console('No metadata available.',2);
	return;
}
gflag.browser.mcm_invokemds();
};

Browser.prototype.mcm_invokemds=function()
{
/* show mdselect ui
select terms to be displayed in metadata colormap
*/
// uncheck all boxes
for(var i=0; i<gflag.mdlst.length; i++) {
	var voc=gflag.mdlst[i];
	for(var t in voc.checkbox) {
		voc.checkbox[t].checked=false;
	}
}
for(var i=0; i<this.mcm.lst.length; i++) {
	var t=this.mcm.lst[i];
	gflag.mdlst[t[1]].checkbox[t[0]].checked=true;
}
var hd=this.mcm.tkholder;
var pos=absolutePosition(hd);
if(pos[0]+hd.clientWidth+300>document.body.clientWidth+document.body.scrollLeft) {
	// place panel on left of mcm
	this.genome.invokemds(1, pos[0]-200-document.body.scrollLeft, pos[1]-document.body.scrollTop);
} else {
	// place panel on right of mcm
	this.genome.invokemds(1, pos[0]+hd.clientWidth+5-document.body.scrollLeft,pos[1]-document.body.scrollTop);
}
}

Genome.prototype.mdvGetallchild=function(term, p2c, lst)
{
if(term in p2c) {
	for(var cterm in p2c[term]) {
		lst.push(cterm);
		this.mdvGetallchild(cterm, p2c, lst);
	}
}
}



function mdCheckboxchange(event)
{
/* on changing a checkbox in metadata selector panel
need to tell which genome this checkbox belongs to
and which browser to place the effect

beware: adding new term during editing annotation of a track
new custom term's checkbox will be simulated with click
new term shall be displayed in mcm, but it will not be used to annotate tk
as only tk attr can be used for annotation
TODO
*/
var term = event.target.term;
var bbj=gflag.menu.bbj;
var mdidx=event.target.mdidx;
switch(bbj.genome.mdselect.which) {
case 1:
	// add to mcm in bbj panel
	bbj.showhide_term_in_mcm([term,mdidx],event.target.checked);
	return;
case 3:
	// editing custom track anno after submission
	// not in use
	if(event.target.checked) {
		/* adding annotation
		to both registry/display objects
		to insert <tr> in table to be used in annotation
		term must be leaf, and could be native or custom
		need to imprint both term and parent info on the <tr>
		*/
		document.getElementById('custtkmdanno_editsaysno').style.display = 'none';
		var showtable=document.getElementById('custtkmdanno_showholder');
		showtable.style.display = 'table';
		// TODO
		bbj.genome.custmd_tableinsert(showtable, term, iscustom, custtkmdannoedit_removeTerm);
		var ft=gflag.ctmae.ft;
		var tkname=gflag.ctmae.tkname;
		// 1: registry object
		var obj = gflag.ctmae.bbj.genome.hmtk[tkname];
		if(!obj.md[mdidx]) {
			obj.md[mdidx]={};
		}
		obj.md[mdidx][term]=1;
		// 2: display object
		obj=gflag.ctmae.bbj.findTrack(tkname);
		if(obj!=null) {
			if(!obj.md[mdidx]) {
				obj.md[mdidx]={};
			}
			obj.md[mdidx][term]=1;
			gflag.ctmae.bbj.prepareMcm();
			gflag.ctmae.bbj.drawMcm();
		}
	} else {
		custtkmdannoedit_removeTerm(term);
	}
	return;
case 4:
	compass_customhub_assignterm(term);
	return;
default:
	fatalError('mdCheckboxchange: unknown bbj.genome.mdselect.which');
}
}



Browser.prototype.mdgettrack=function(term,mdidx,tkset)
{
/* search for any tracks annotated by an attribute, store in hash, key is track name

args:
- term: term name
- mdidx: genome.mdlst array index, to find the voc
	(term and mdidx must be consistent!)
- tkset: {}
*/
var voc=gflag.mdlst[mdidx];
if(term in voc.p2c) {
	// not leaf
	for(var cterm in voc.p2c[term]) {
		this.mdgettrack(cterm, mdidx, tkset);
	}
} else {
	// is leaf
	for(var n in this.genome.hmtk) {
		var tk=this.genome.hmtk[n];
		if(!tk.md) continue;
		if(tk.md[mdidx]==undefined) continue;
		if(term in tk.md[mdidx]) {
			tkset[n] = 1;
		}
	}
}
}

Browser.prototype.drawMcm_onetrack=function(tkobj,tosvg)
{
if(!this.mcm || !this.mcm.lst) return [];
var svgdata=[];
var c = tkobj.atC;
var h = tk_height(tkobj);
if(!c.alethiometer) {
	c.height = h;
	c.width = this.mcm.lst.length * tkAttrColumnWidth;
}
var ctx = c.getContext('2d');
var clen = colorCentral.longlst.length-1;
for(var j=0; j<this.mcm.lst.length; j++) {
	ctx.fillStyle = tkobj.attrcolor[j];
	ctx.fillRect(j*tkAttrColumnWidth,0,tkAttrColumnWidth-1,h);
	if(tosvg) svgdata.push({type:svgt_rect_notscrollable,x:j*tkAttrColumnWidth,w:tkAttrColumnWidth-1,h:h,fill:ctx.fillStyle});
}
c.attr = tkobj.attrlst;
if(tosvg) return svgdata;
}

Browser.prototype.recursiveFetchTrackAttr=function(term, mdcidx, tkobj)
{
/* args:
	term:
	mdcidx: bbj.mcm.lst array idx
	tkobj: tklst array element
sets tkobj.attrlst[mdcidx] using the attr value in .attrhash.....
*/
var mdidx=this.mcm.lst[mdcidx][1];
if(!tkobj.md[mdidx]) {
	// no md hash for this voc
	return;
}
var voc=gflag.mdlst[mdidx];
if(!(term in voc.p2c)) {
	// leaf
	if(term in tkobj.md[mdidx]) {
		tkobj.attrlst[mdcidx] = term;
	}
	return;
}
for(var cterm in voc.p2c[term]) {
	this.recursiveFetchTrackAttr(cterm, mdcidx, tkobj);
}
}

Browser.prototype.initiateMdcOnshowCanvas=function()
{
/* make or re-make mcm holder table according to contents in _browser.mcm.lst
write metadata categories vertically, check metadata voc tree checkboxes, only do once
*/
if(!this.mcm || !this.mcm.holder) return;
var holder=this.mcm.holder;
stripChild(holder.firstChild.firstChild, 0); // table-tbody-tr
var terms=this.mcm.lst;
if(terms.length==0) {
	if(gflag.mdlst.length==0) {
		// no md
		return;
	}
	// no term, make clickable blank
	var c=makecanvaslabel({str:'add terms', color:colorCentral.foreground_faint_5,bottom:true});
	c.title='Click to add metadata terms to metadata color map';
	c.className='tkattrnamevcanvas';
	c.onclick=button_mcm_invokemds;
	holder.firstChild.firstChild.insertCell(-1).appendChild(c);
	this.mcmPlaceheader();
	return;
}
holder.style.width = tkAttrColumnWidth * terms.length;
for(var i=0; i<terms.length; i++) {
	var s=terms[i];
	var voc=gflag.mdlst[s[1]];
	var c = makecanvaslabel({str:(s[0] in voc.idx2attr ? voc.idx2attr[s[0]] : s[0]),bottom:true});
	c.className='tkattrnamevcanvas';
	c.termname=s[0];
	c.mdidx=s[1];
	c.onclick=mcm_termname_click;
	c.onmousedown=mcm_termname_MD;
	c.oncontextmenu=menu_mcm_header;
	holder.firstChild.firstChild.insertCell(-1).appendChild(c);
}
this.mcmPlaceheader();
}


function mdterm_print(d,term,voc) {
/* d - holder
term - term id or name
voc  - md voc
*/
var d3=dom_create('div',d);
d3.className='mdt_box';
if(voc.color) {
	d3.style.borderTop='solid 2px '+voc.color;
}
d3.voc=voc;
d3.innerHTML=term in voc.idx2attr ? voc.idx2attr[term] : term;
d3.title=term in voc.idx2desc ? voc.idx2desc[term] : term;
d3.term=term;
d3.onclick=function(event){mdt_box_click(event.target,term,voc);};
}

function mdt_box_click(box,term,voc)
{
/* from inside menu > tk detail > md term listing
click box
*/
if(box.className!='mdt_box') box=box.parentNode;
if(box.__clc) {
	box.__clc=false;
	box.innerHTML=term in voc.idx2attr ? voc.idx2attr[term] : term;
	return;
}
var indent='&nbsp;&nbsp;&nbsp;';
var lst=[];
// FIXME not handling multi-parent case
var x=term;
while(x in voc.c2p) {
	var y=undefined;
	for(y in voc.c2p[x]) {
		break;
	}
	lst.unshift(y);
	x=y;
}
var name= term in voc.idx2attr ? voc.idx2attr[term] : term;
lst.push(name);
var slst=[];
for(var i=0; i<lst.length; i++) {
	slst.push('<div');
	if(i<lst.length-1) {
		slst.push(' style="font-size:80%"');
	}
	slst.push('>');
	for(var j=0; j<i; j++) {
		slst.push(indent);
	}
	if(i>0) { slst.push('&#9492;&nbsp;');}
	slst.push(lst[i]);
	slst.push('</div>');
}
box.innerHTML=slst.join('')+
	(term in voc.idx2desc ? 
	'<div style="font-size:70%;opacity:.8;">'+voc.idx2desc[term]+'<br>'+
	'term id: '+term+
	'</div>' : ''
	);
box.__clc=true;
}

function mdshowhide(event)
{
/* called by clicking on <span> inside <li>, which is non-leaf metadata term
<li>'s next sibling must be <ul>, and will show/hide it
*/
var li = event.target.parentNode;
if(li.tagName!='LI') {
	li=li.parentNode;
}
var x=li.firstChild;
if(x.tagName=='INPUT') x=x.nextSibling;
var icon = x.firstChild;
var ul=li.nextSibling;
if(ul.style.display == 'none') {
	ul.style.display = "block";
	icon.innerHTML = '&#8863;';
} else {
	ul.style.display = 'none';
	icon.innerHTML = '&#8862;';
}
}

function parse_nativemd(tk)
{
// arg: registry object, from mdlst to md
if(!tk.mdlst) return;
if(!tk.md) tk.md=[];
var s={};
for(var i=0; i<tk.mdlst.length; i++) {
	s[tk.mdlst[i]]=1;
}
tk.md[0]=s;
delete tk.mdlst;
}

Browser.prototype.tknamelst_getmdidxhash=function(namelst)
{
/* given a list of tknames, need to update all facet associated with those tracks
find out mdidx and give a hash of it
*/
var hash={};
for(var i=0; i<namelst.length; i++) {
	var o=this.genome.hmtk[namelst[i]];
	if(o && o.md) {
		for(var j=0; j<o.md.length; j++) {
			if(o.md[j]) {
				hash[j]=1;
			}
		}
	}
}
return hash;
}

function md_findterm(md, words)
{
var hits=[];
for(var t in md.c2p) {
	var s;
	if(t in md.idx2attr) {
		s=md.idx2attr[t].toLowerCase();
	} else {
		s=t.toLowerCase();
	}
	var allmatch=true;
	for(var j=0; j<words.length; j++) {
		if(s.indexOf(words[j])==-1) { allmatch=false; }
	}
	if(allmatch) {
		var x=parseInt(t);
		hits.push(isNaN(x)?t:x);
	}
}
return hits;
}


function words2mdterm(lst)
{
var words=[];
for(var i=0; i<lst.length; i++) {
	words.push(lst[i].toLowerCase());
}
var hits=[];
for(var i=0; i<gflag.mdlst.length; i++) {
	var h=md_findterm(gflag.mdlst[i],words);
	for(var j=0; j<h.length; j++) {
		hits.push([h[j],i]);
	}
}
return hits;
}

Browser.prototype.load_metadata_url=function(url)
{
// currently internal, not called from user action on ui
var bbj=this;
this.ajaxText('loaddatahub=on&url='+url,function(text){bbj.loadmetadata_jsontext(text,url);});
}

Browser.prototype.loadmetadata_jsontext=function(text,url)
{
if(!text) {
	print2console('Cannot load metadata file '+url,2);
	this.__hubfailedmdvurl[url]=1;
} else {
	var j=parse_jsontext(text);
	if(j) {
		if(!j.vocabulary) {
			print2console('vocabulary missing from metadata '+url,2);
			this.__hubfailedmdvurl[url]=1;
		} else {
			j.sourceurl=url;
			load_metadata_json(j);
		}
	} else {
		print2console('Invalid metadata JSON: '+url,2);
		this.__hubfailedmdvurl[url]=1;
	}
}
if(this.__pending_hubjson) {
	var ibp=this.__pending_hubjson;
	delete this.__pending_hubjson;
	this.loaddatahub_json(ibp);
}
}

function load_metadata_json(raw)
{
var obj={
	c2p:{},
	p2c:{},
	root:{},
	checkbox:{},
	idx2attr:{},
	idx2desc:{},
	idx2color:{},
};
gflag.mdlst.push(obj);
var idx=gflag.mdlst.length-1;

for(var term in raw.vocabulary) {
	parse_metadata_recursive(null, term, raw.vocabulary[term], obj);
	obj.root[term]=1;
}
if(raw.tag) {
	obj.tag=raw.tag;
}
if(raw.sourceurl) {
	obj.sourceurl=raw.sourceurl;
} else {
	// no source url, not a shared md
	if(raw.source) obj.source=raw.source;
	obj.original=raw; // for stringify
}
if(raw.terms) {
	for(var t in raw.terms) {
		var v=raw.terms[t];
		if(Array.isArray(v)) {
			if(v.length==0) {
				print2console('Empty array for term definition ('+t+')',2);
				v=['unidentified_'+t];
			}
			obj.idx2attr[t]=v[0];
			if(v[1]) {
				obj.idx2desc[t]=v[1];
			}
			if(v[2]) {
				obj.idx2color[t]=v[2];
			}
		}
	}
}
// for showing in c31
var d=document.createElement('div');
d.style.margin=10;
obj.main=d;
var ul=dom_create('ul',d,'padding:5px 10px;margin:0px;');
if(obj.color) {
	ul.style.borderTop='solid 2px '+obj.color;
	ul.style.backgroundColor=lightencolor(colorstr2int(obj.color),0.9);
}
obj.mainul=ul;
for(var rt in obj.root) {
	make_mdtree_recursive(rt,obj,idx,ul);
}
return idx;
}


function make_mdtree_recursive(term, mdobj, idx, holder)
{
var li=dom_create('li',holder);
// a checkbox for each term, no matter child or parent
var cb=dom_create('input',li);
cb.type='checkbox';
cb.term=term;
cb.mdidx=idx;
cb.onchange=mdCheckboxchange;
mdobj.checkbox[term]=cb;
if(term in mdobj.p2c) {
	// not leaf
	var s=dom_addtext(li,'<span>&#8862;</span> '+term,null,'clb');
	s.onclick=mdshowhide;
	var ul2=dom_create('ul',holder,'display:none;');
	for(var cterm in mdobj.p2c[term]) {
		make_mdtree_recursive(cterm, mdobj, idx, ul2);
	}
} else {
	// is leaf
	dom_addtext(li, 
		(term in mdobj.idx2attr ? mdobj.idx2attr[term] : term)+
		(term in mdobj.idx2desc ? '<div style="font-size:70%;opacity:.7;">'+mdobj.idx2desc[term]+'</div>' : '')
	);
}
}



function mdtermsearch_show(forwhat,handler,mdidxlimit)
{
// handler must be a closure function
menu_shutup();
menu.c55.style.display='block';
menu.c55.says.innerHTML=forwhat;
menu.c56.style.display='block';
menu.c56.hit_handler=handler;
menu.c56.input.focus();
if(mdidxlimit) {
	menu.c56.mdidxlimit=mdidxlimit;
} else {
	delete menu.c56.mdidxlimit;
}
}

function mdtermsearch_ku(event) {if(event.keyCode==13) mdtermsearch();}
function mdtermsearch()
{
var d=menu.c56;
if(d.input.value.length==0) return;
if(d.input.value.length==1) {
	print2console('Can\'t search by just one letter',2);
	return;
}
var re=words2mdterm([d.input.value]);
if(re.length==0) {
	print2console('No hits',2);
	return;
}
if(d.mdidxlimit!=undefined) {
	var lst=[];
	for(var i=0; i<re.length; i++) {
		if(re[i][1]==d.mdidxlimit) {
			lst.push(re[i]);
		}
	}
	re=lst;
}
// group terms by vocabulary
var mdidx2term=[];
for(var i=0; i<gflag.mdlst.length; i++) { mdidx2term.push([])}
for(var i=0; i<re.length; i++) {
	mdidx2term[re[i][1]].push(re[i][0]);
}
d.table.style.display='block';
stripChild(d.table,0);
// first show terms from shared voc
var hasprivate=false;
for(var i=1; i<mdidx2term.length; i++) {
	if(mdidx2term[i].length==0) {continue;}
	var md=gflag.mdlst[i];
	if(md.sourceurl) {
		var tr=d.table.insertRow(-1);
		var td=tr.insertCell(0);
		td.colSpan=3;
		td.style.fontSize='70%';
		td.innerHTML='following terms are from this shared vocabulary<br><a href='+md.sourceurl+' target=_blank>'+md.sourceurl+'</span>';
		for(var j=0; j<mdidx2term[i].length; j++) {
			var tr=d.table.insertRow(-1);
			var td=tr.insertCell(0);
			var tid=mdidx2term[i][j];
			var tn=null;
			if(tid in md.idx2attr) {
				td.innerHTML='id: '+tid;
			}
			td=tr.insertCell(1);
			mdterm_print(td,tid,md);
			if(menu.c56.hit_handler) {
				td=tr.insertCell(2);
				dom_addtext(td,'use &#187;',null,'clb').onclick=menu.c56.hit_handler([tid,i]);
			}
		}
	} else {
		hasprivate=true;
	}
}
if(hasprivate) {
	var tr=d.table.insertRow(-1);
	var td=tr.insertCell(0);
	td.colSpan=3;
	td.style.fontSize='70%';
	td.innerHTML='following terms are from private vocabularies';
	for(var i=1; i<mdidx2term.length; i++) {
		if(mdidx2term[i].length==0) {continue;}
		var md=gflag.mdlst[i];
		if(!md.sourceurl) {
			for(var j=0; j<mdidx2term[i].length; j++) {
				var tr=d.table.insertRow(-1);
				var td=tr.insertCell(0);
				var tid=mdidx2term[i][j];
				var tn=null;
				if(tid in md.idx2attr) {
					td.innerHTML='id: '+tid;
				}
				td=tr.insertCell(1);
				mdterm_print(td,tid,md);
				if(menu.c56.hit_handler) {
					td=tr.insertCell(2);
					dom_addtext(td,'use &#187;',null,'clb').onclick=menu.c56.hit_handler([tid,i]);
				}
			}
		}
	}
}
}

/*** __md__ over ***/





/*** __mcm__ colormap **/

Browser.prototype.mcm_mayaddgenome=function()
{
if(!this.mcm) return;
// show genome in mcm
var mdi=getmdidx_internal();
if(mdi==-1) return;
for(var k=0; k<this.mcm.lst.length; k++) {
	var mt=this.mcm.lst[k];
	if(mt[1]==mdi && mt[0]==literal_imd_genome) return k;
}
this.mcm.lst.push([literal_imd_genome,mdi]);
return this.mcm.lst.length-1;
}

Browser.prototype.showhide_term_in_mcm=function(term,show)
{
/* show or remove a term from mcm
term follows bbj.mcm.lst style [term, mdidx]
*/
if(!this.mcm) return;
if(show) {
	for(var i=0; i<this.mcm.lst.length; i++) {
		var t=this.mcm.lst[i];
		if(t[1]==term[1] && t[0]==term[0]) return;
	}
	this.mcm.lst.push(term);
} else {
	for(var i=0; i<this.mcm.lst.length; i++) {
		var s=this.mcm.lst[i];
		if(s[1]==term[1] && s[0]==term[0]) {
			this.mcm.lst.splice(i,1);
			break;
		}
	}
}
this.initiateMdcOnshowCanvas();
this.prepareMcm();
this.drawMcm();
this.__mcm_termchange();
}

function mcm_termname_click(event)
{
// clicking on mcm term name canvas
var bbj=gflag.browser;
for(var i=0; i<bbj.mcm.lst.length; i++) {
	var s=bbj.mcm.lst[i];
	if(s[1]==event.target.mdidx && s[0]==event.target.termname) break;
}
if(i==bbj.mcm.lst.length) return;
bbj.mcm.sortidx=i;
bbj.mcm.manuallysorted=true;
bbj.mcm_sort();
}

function mcm_termname_MD(event)
{
// for rearranging term canvas in mcm
if(event.button!=0) return;
event.preventDefault();
var lst=gflag.browser.mcm.lst;
for(var i=0; i<lst.length; i++) {
	if(lst[i][1]==event.target.mdidx && lst[i][0]==event.target.termname) { break; }
}
gflag.mcmtermmove={
	idx:i,
	mx:event.clientX };
document.body.addEventListener('mousemove', mcm_termname_M, false);
document.body.addEventListener('mouseup', mcm_termname_MU, false);
}

function mcm_termname_M(event)
{
event.preventDefault();
var m=gflag.mcmtermmove;
var bbj=gflag.browser;
var mdlst=bbj.mcm.lst;
if(event.clientX>m.mx) {
	// to right
	if(m.idx==mdlst.length-1) return;
	if(event.clientX-m.mx >= tkAttrColumnWidth) {
		var ss=mdlst[m.idx+1];
		mdlst[m.idx+1]=mdlst[m.idx];
		mdlst[m.idx]=ss;
		bbj.initiateMdcOnshowCanvas();
		bbj.prepareMcm();
		bbj.drawMcm();
		m.mx=event.clientX;
		m.idx++;
	}
} else if(event.clientX<m.mx) {
	// to left
	if(m.idx==0) return;
	if(m.mx-event.clientX >= tkAttrColumnWidth) {
		var ss=mdlst[m.idx-1];
		mdlst[m.idx-1]=mdlst[m.idx];
		mdlst[m.idx]=ss;
		bbj.initiateMdcOnshowCanvas();
		bbj.prepareMcm();
		bbj.drawMcm();
		m.mx=event.clientX;
		m.idx--;
	}
}
}
function mcm_termname_MU()
{
document.body.removeEventListener('mousemove', mcm_termname_M, false);
document.body.removeEventListener('mouseup', mcm_termname_MU, false);
}

Browser.prototype.mcm_sort=function()
{
/* sort but not stuffing track doms!
should call this to separate tracks in and out of ghm
so that .where 1 and 2 are not mixed
even when .mcm.lst is empty, can still run
*/
if(!this.mcm || !this.mcm.lst) return;
if(this.weaver && this.weaver.iscotton) {
	// only applies to target
	return;
}
var hmlst=[], nhlst=[];
for(var i=0; i<this.tklst.length; i++) {
	var tk=this.tklst[i];
	if(tk.where==1) {
		hmlst.push(tk);
	} else {
		nhlst.push(tk);
	}
}
if(this.mcm.lst.length==0) {
	this.tklst=hmlst.concat(nhlst);
	return;
}
if(this.mcm.sortidx >= this.mcm.lst.length) {
	this.mcm.sortidx=0;
}
if(this.weaver) {
	var mdi=getmdidx_internal();
	var t=this.mcm.lst[this.mcm.sortidx];
	if(t[1]==mdi && t[0]==literal_imd_genome) {
		// in case of weaving and clicking genome term name, will sort all tracks by genome
		var ttk=[];
		var g2tk={};
		for(var n in this.weaver.q) {
			g2tk[n]=[];
		}
		for(var i=0; i<this.tklst.length; i++) {
			var tk=this.tklst[i];
			tk.where=1;
			tk.atC.style.display='block';
			if(tk.cotton) {
				g2tk[tk.cotton].push(tk);
			} else {
				ttk.push(tk);
			}
		}
		for(var n in g2tk) {
			// add weavertk first
			var lst=g2tk[n];
			for(var i=0; i<lst.length; i++) {
				if(lst[i].ft==FT_weaver_c) {
					ttk.push(lst[i]);
					break;
				}
			}
			for(var i=0; i<lst.length; i++) {
				if(lst[i].ft!=FT_weaver_c) {
					ttk.push(lst[i]);
				}
			}
		}
		this.tklst=ttk;
		this.trackdom2holder();
		return;
	}
}
var m2tk={_empty_:[]};
for(var i=0; i<hmlst.length; i++) {
	var tk=hmlst[i];
	var av=tk.attrlst[this.mcm.sortidx];
	if(av==undefined) {
		m2tk._empty_.push(tk);
	} else {
		if(av in m2tk) {
			m2tk[av].push(tk);
		} else {
			m2tk[av]=[tk];
		}
	}
}
var newlst=[];
for(var av in m2tk) {
	if(av=='_empty_') continue;
	for(var i=0; i<m2tk[av].length; i++) {
		newlst.push(m2tk[av][i]);
	}
}
if('_empty_' in m2tk) {
	for(var i=0; i<m2tk._empty_.length; i++) {
		newlst.push(m2tk._empty_[i]);
	}
}
this.tklst=newlst.concat(nhlst);
this.trackdom2holder();
for(var sk in this.splinters) {
	var b=this.splinters[sk];
	if(b.tklst.length!=this.tklst.length) continue;
	// cannot call mcm_sort on splinter, no mcm
	var newlst=[];
	for(var i=0; i<this.tklst.length; i++) {
		var n=this.tklst[i].name+this.tklst[i].cotton;
		for(var j=0; j<b.tklst.length; j++) {
			var t2=b.tklst[j];
			if(t2.name+t2.cotton==n) {
				newlst.push(t2);
				break;
			}
		}
	}
	b.tklst=newlst;
	b.trackdom2holder();
}
}

Browser.prototype.prepareMcm=function()
{
/* requires:
bbj.mcm.lst and tklst[x].md
*/
// wipe out old data
if(!this.mcm || !this.mcm.lst) return;
for(var i=0; i<this.tklst.length; i++) {
	var tk=this.tklst[i];
	if(tkishidden(tk)) continue;
	tk.attrlst=[];
	tk.attrcolor=[];
}
for(i=0; i<this.mcm.lst.length; i++) {
	this.prepareMcM_oneterm(i);
}
}

Browser.prototype.prepareMcM_oneterm=function(mdcidx)
{
/* arg: bbj.mcm.lst array index
make tk.attrlst[mdcidx] for each track
different treatment for native/custom metadata

! expansion: md may supply color for each term
*/
var term = this.mcm.lst[mdcidx][0];
var tidhash = {};
for(var i=0; i<this.tklst.length; i++) {
	this.recursiveFetchTrackAttr(term, mdcidx, this.tklst[i]);
	var tid = this.tklst[i].attrlst[mdcidx];
	if(tid != undefined) {
		tidhash[tid]=1;
	}
}
var i=0, clen=colorCentral.longlst.length;
var mdobj=gflag.mdlst[this.mcm.lst[mdcidx][1]];
for(var tid in tidhash) {
	if(tid in mdobj.idx2color) {
		tidhash[tid]= mdobj.idx2color[tid];
	} else {
		if(i>=clen) {
			var f = parseInt(i/clen);
			tidhash[tid]=darkencolor(colorstr2int(colorCentral.longlst[i%clen]), f<10?f/10:1);
		} else {
			tidhash[tid]=colorCentral.longlst[i];
		}
		i++;
	}
}
for(i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	var tid=t.attrlst[mdcidx];
	t.attrcolor[mdcidx] = (tid==undefined)?colorCentral.foreground_faint_5:tidhash[tid];
}
}

Browser.prototype.getHmtkIdxlst_mcmCell=function(mcidx, tkname, cotton)
{
/* args:
mcidx: bbj.mcm.lst array idx
tkname: hmtk name
return null if clicked on an area with no annotation data
*/
var tkidx=-1;
for(var i=0; i<this.tklst.length; i++) {
	if(this.tklst[i].name==tkname) {
		if(cotton && this.tklst[i].cotton==cotton) {
			tkidx=i;
			break;
		} else if(!cotton && !this.tklst[i].cotton) {
			tkidx=i;
			break;
		}
	}
}
if(tkidx==-1) return null;
var m=this.tklst[tkidx].attrlst[mcidx];
if(m==undefined) return null;
// all tracks in the same color block
var tkarr=[tkidx];
for(i=tkidx-1; i>=0; i--) {
	if(this.tklst[i].attrlst[mcidx]==m)
		tkarr.unshift(i);
	else
		break;
}
for(i=tkidx+1; i<this.tklst.length; i++) {
	if(this.tklst[i].where!=1) break;
	if(this.tklst[i].attrlst[mcidx]==m)
		tkarr.push(i);
	else
		break;
}
return tkarr;
}

Browser.prototype.movetk_hmtk=function(tkidxlst, up)
{
/* a group of them can be moved at same time
but only move up/down for one track at each move
this is not supposed to be called on splinters
*/
var hmlst=[], nhlst=[], hidelst=[];
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if(tkishidden(t)) {hidelst.push(t);}
	else if(t.where==1) {hmlst.push(t);}
	else {nhlst.push(t);}
}
if(up) {
	var el=hmlst.splice(tkidxlst[0]-1,1)[0];
	hmlst.splice(tkidxlst[tkidxlst.length-1],0,el);
} else {
	var el=hmlst.splice(tkidxlst[tkidxlst.length-1]+1,1)[0];
	hmlst.splice(tkidxlst[0],0,el);
}
var d1=this.hmdiv;
var d2=this.mcm?this.mcm.tkholder:null;
var d3=this.hmheaderdiv;
for(var i=0; i<hmlst.length; i++) {
	var t=hmlst[i];
	if(t.canvas) { d1.appendChild(t.canvas); }
	if(d2 && t.atC) {d2.appendChild(t.atC);}
	if(d3 && t.header) {d3.appendChild(t.header);};
}
this.tklst=hmlst.concat(nhlst.concat(hidelst));
this.splinterSynctkorder();
}




Browser.prototype.mcmPlaceheader=function()
{
var m=this.mcm;
if(!m || !m.holder) return;
/* this is to escape for alethiometer
*/
var lst=m.holder.firstChild.firstChild.childNodes;
if(m.holder.attop==undefined) {
	for(var i=0; i<lst.length; i++)
		lst[i].vAlign='bottom';
	return;
}
if(m.holder.attop) {
	m.headerholder_top.appendChild(m.holder);
	m.holder.style.top='';
	m.holder.style.bottom=0;
} else {
	m.headerholder_bottom.appendChild(m.holder);
	m.holder.style.top=0;
	m.holder.style.bottom='';
}
for(var i=0; i<lst.length; i++) {
	lst[i].vAlign=m.holder.attop?'bottom':'top';
}
}


function show_mcmColorConfig()
{
// called by clicking menu.c9
menu_shutup();
menu.style.left=Math.min(parseInt(menu.style.left),document.body.clientWidth-300);
var holder=menu.c9.nextSibling;
holder.style.display='block';
stripChild(holder,0);
var tr=holder.insertRow(0);
var td=tr.insertCell(0);
td.colSpan=3;
td.innerHTML='Change color setting<div style="color:#858585;font-size:60%;">These colors are used to paint metadata color map</div>';
for(var i=0; i<3; i++) {
	tr=holder.insertRow(-1);
	for(var j=0; j<3; j++) {
		var sid=i*3+j;
		td=tr.insertCell(-1);
		td.innerHTML='&nbsp;';
		td.style.backgroundColor=colorCentral.longlst[sid];
		td.sid=sid;
		td.addEventListener('click',mcm_configcolor_initiate,false);
	}
}
td=holder.insertRow(-1).insertCell(0);
td.colSpan=3;
td.innerHTML='<button type=button onclick=mcm_configcolor_restore()>Restore default settings</button>';
}

function mcm_configcolor_restore()
{
var lst=[];
for(var i=0; i<colorCentral.longlst_bk.length; i++) lst.push(colorCentral.longlst_bk[i]);
colorCentral.longlst=lst;
show_mcmColorConfig();
gflag.menu.bbj.drawMcm(false);
}


function mcm_configcolor_initiate(event)
{
paletteshow(event.clientX, event.clientY, 12);
palettegrove_paint(event.target.style.backgroundColor);
menu.colorlonglstcell=event.target;
}
function mcm_configcolor()
{
var c=menu.colorlonglstcell;
c.style.backgroundColor=
colorCentral.longlst[c.sid]= palette.output;
gflag.menu.bbj.drawMcm(false);
}

function mcm_Mdown(event)
{
/* press mouse on .atC */
if(event.button!=0) return;
event.preventDefault();
var pos=absolutePosition(event.target);
var mcidx=parseInt((event.clientX+document.body.scrollLeft-pos[0])/tkAttrColumnWidth);
var bbj=gflag.browser;
var tkarr=bbj.getHmtkIdxlst_mcmCell(mcidx, event.target.tkname,event.target.cotton);
if(tkarr==null) return;
var lst=[];
for(var i=0; i<tkarr.length; i++) {
	lst.push(bbj.tklst[tkarr[i]]);
}
bbj.highlighttrack(lst);
gflag.mcmMove={
	bbj:bbj,
	oldy:event.clientY+document.body.scrollTop,
	basey:absolutePosition(event.target.parentNode)[1],
	tkarr:tkarr,
	midx:mcidx};
document.body.addEventListener('mousemove',mcmMoveM,false);
document.body.addEventListener('mouseup',mcmMoveMU,false);
}
function mcmMoveM(event)
{
var m=gflag.mcmMove;
var bbj=m.bbj;
var cy=event.clientY+document.body.scrollTop;
var up=true;
if(cy>m.oldy) {
	if(cy>m.basey+bbj.hmdiv.clientHeight) return;
	up=false;
} else if(cy<m.oldy) {
	if(cy<m.basey) return;
} else {
	return;
}
if(up) {
	if(m.tkarr[0]==0) return;
	if(m.oldy-cy>=tk_height(bbj.tklst[m.tkarr[0]-1])) {
		bbj.movetk_hmtk(m.tkarr, true);
		m.oldy=cy;
		m.tkarr=bbj.getHmtkIdxlst_mcmCell(m.midx, bbj.tklst[m.tkarr[0]-1].name, bbj.tklst[m.tkarr[0]-1].cotton);
		var lst=[];
		for(var i=0; i<m.tkarr.length; i++) lst.push(bbj.tklst[m.tkarr[i]]);
		bbj.highlighttrack(lst);
	}
} else {
	if(m.tkarr[m.tkarr.length-1]==bbj.hmdiv.childNodes.length-1) return;
	if(cy-m.oldy>=tk_height(bbj.tklst[m.tkarr[m.tkarr.length-1]+1])) {
		bbj.movetk_hmtk(m.tkarr, false);
		m.oldy=cy;
		m.tkarr=bbj.getHmtkIdxlst_mcmCell(m.midx, bbj.tklst[m.tkarr[m.tkarr.length-1]+1].name, bbj.tklst[m.tkarr[m.tkarr.length-1]+1].cotton);
		var lst=[];
		for(var i=0; i<m.tkarr.length; i++) lst.push(bbj.tklst[m.tkarr[i]]);
		bbj.highlighttrack(lst);
	}
}
}

function mcmMoveMU(event)
{
indicator3.style.display='none';
document.body.removeEventListener('mousemove',mcmMoveM,false);
document.body.removeEventListener('mouseup',mcmMoveMU,false);
}

function mcm_tooltipmove(event)
{
// show pica over mcm track canvas
var bbj=gflag.browser;
var tk=bbj.findTrack(event.target.tkname,event.target.cotton);
var pos=absolutePosition(event.target);
// mcm.lst idx
var mcidx=parseInt((event.clientX+document.body.scrollLeft-pos[0])/tkAttrColumnWidth);
var m=tk.attrlst[mcidx];
if(m==undefined) {
	pica.style.display='none';
	return;
}
pica.style.display='block';
var voc=gflag.mdlst[bbj.mcm.lst[mcidx][1]];
var plst=[];
for(var x in voc.c2p[m]) {
	plst.push(x);
}
picasays.innerHTML= (m in voc.idx2attr ? voc.idx2attr[m] : m)+
	(m in voc.idx2desc ? '<div style="color:white;font-size:80%;">'+voc.idx2desc[m]+'</div>' : '')+
	'<div style="margin-top:5px;color:white;font-size:80%;">parent: '+
	plst.join(', ')+'</div>';
pica_go(event.clientX,event.clientY);
}

function mcm_Mover(event)
{
var bbj=gflag.browser;
var tk=bbj.findTrack(event.target.tkname,event.target.cotton);
tk.header.style.backgroundColor=colorCentral.tkentryfill;
}
function mcm_Mout(event)
{
var bbj=gflag.browser;
var tk=bbj.findTrack(event.target.tkname,event.target.cotton);
tk.header.style.backgroundColor='transparent';
pica.style.display='none';
}

function mcm_addterm_closure(term)
{
return function(){mcm_addterm(term);};
}
function mcm_addterm(term)
{
gflag.menu.bbj.showhide_term_in_mcm(term,true);
}


/*** __mcm__ over **/



function tkentry_click(event)
{
/* clicking on a track entry in menu list, accumulates selected ones
the item (list) should always be hosted in one of the panels in menu:
- facet tklst table
- general purpose track selection panel, for all types of tracks that are currently on show
  including hmtk and decor
*/
var bbj=gflag.menu.bbj;
var add = false;
if(event.target.className=='tkentry') {
	event.target.className='tkentry_onfocus';
	add = true;
} else if(event.target.className=='tkentry_onfocus') {
	event.target.className='tkentry';
}
var tkname = event.target.tkname;
var tkobj=bbj.findTrack(tkname);
var ft=null, tknameurl=null;
/* notice: display object can be missing
in case of facet track selection
*/
if(tkobj!=null) {
	ft=tkobj.ft;
	tknameurl=isCustom(ft) ? tkobj.url : tkname;
}
var butt=menu.facettklstdiv.submit;
var s=butt.count;
butt.count+=add?1:-1;
if(butt.count==0) {
	butt.style.display='none';
} else {
	butt.innerHTML='Add '+butt.count+' track'+(butt.count>1?'s':'');
	butt.style.display='inline';
}
}


/* __decor__ good old decor tk */

function decorJson_parse(val,hash)
{
if(Array.isArray(val)) {
	for(var i=0; i<val.length; i++) {
		hash[val[i].name]=val[i];
	}
} else {
	for(var k in val) {
		decorJson_parse(val[k],hash);
	}
}
}

function decorTrackcell_make(tk,holder)
{
tk.tksentry=dom_addtkentry(2,holder,false,tk,tk.label,decortkentry_click);
}

function dom_maketree(val,holder,makecell)
{
if(!val) return;
if(Array.isArray(val)) {
	for(var i=0; i<val.length; i++) {
		makecell(val[i],holder);
	}
} else {
	var tabs=[];
	for(var n in val) {
		tabs.push(n);
	}
	var t=make_tablist({lst:tabs});
	t.style.margin='';
	holder.appendChild(t);
	for(var i=0; i<tabs.length; i++) {
		dom_maketree(val[tabs[i]],t.holders[i],makecell);
	}
}
}

function decortkentry_click(event)
{
if(event.target.className=='tkentry_inactive') return;
event.target.className='tkentry_inactive';
var bbj=gflag.menu.bbj;
if(bbj.trunk) bbj=bbj.trunk;
bbj.adddecorparam([event.target.tkobj.name]);
bbj.ajax_loadbbjdata(bbj.init_bbj_param);
}

Browser.prototype.adddecorparam=function(names)
{
var lst=[];
for(var i=0; i<names.length; i++) {
	var o=this.genome.decorInfo[names[i]];
	if(!o) {
		print2console('Unrecognized native track: '+names[i],2);
		continue;
	}
	var o2=duplicateTkobj(o);
	o2.mode= o.defaultmode ? o.defaultmode : tkdefaultMode(o);
	// XXXb
	if(names[i].indexOf('snp')!=-1) {
		var v=this.getDspStat();
		if(v[0]==v[2]) {
			if(v[3]-v[1] >= 20000) {
				o2.mode=M_den;
			}
		} else {
			o2.mode=M_den;
		}
	}
	lst.push(o2);
}
if(lst.length==0) return;
if(!this.init_bbj_param) {
	this.init_bbj_param={tklst:[]};
}
if(!this.init_bbj_param.tklst) {
	this.init_bbj_param.tklst=[];
}
this.init_bbj_param.tklst=this.init_bbj_param.tklst.concat(lst);
}



/* __decor__ ends */





function kwsearch_tipover(event)
{
picasays.innerHTML='Keywords are case insensititve<br><br>join multiple keywords by <b>AND</b><br><br>e.g. "brain AND h3k4me3"<br><br>To broaden your search, incorporate additional data sets or datahubs';
pica_go(event.clientX,event.clientY);
}

function tkitemkwsearch_ku(event){if(event.keyCode==13) tkitemkwsearch();}
function tkitemkwsearch()
{
var bbj=gflag.menu.bbj;
var ip=menu.c47.input;
if(ip.value.length==0) {
	print2console('Please enter name to search',2);
	return;
}
stripChild(menu.c47.table,0);
bbj.ajax('searchtable='+gflag.menu.tklst[0].name+'&text='+ip.value+'&dbName='+bbj.genome.name,function(data){bbj.tkitemkwsearch_cb(data);});
}
Browser.prototype.tkitemkwsearch_cb=function(data)
{
menu_shutup();
menu.c47.style.display='block';
if(!data || !data.lst) {
	var tr=menu.c47.table.insertRow(0);
	tr.insertCell(0).innerHTML='Server error!';
	return;
}
if(data.lst.length==0) {
	var tr=menu.c47.table.insertRow(0);
	tr.insertCell(0).innerHTML='No hits found.';
	return;
}
for(var i=0; i<data.lst.length; i++) {
	var tr=menu.c47.table.insertRow(-1);
	tr.className='clb_o';
	var c=data.lst[i];
		tr.coord=c.chrom+':'+c.start+'-'+c.stop;
	tr.itemname=c.name;
	tr.addEventListener('click',menu_jump_highlighttkitem,false);
	var td=tr.insertCell(0);
	td.innerHTML=c.name;
	td=tr.insertCell(1);
	td.innerHTML=c.chrom+':'+c.start+'-'+c.stop;
}
}

function tkkwsearch_ku(event){if(event.keyCode==13) tkkwsearch();}
function tkkwsearch()
{
/* search all tracks
cgi does sql query
*/
var bbj=gflag.menu.bbj;
var ip=menu.grandadd.kwinput;
if(ip.value.length==0) {
	print2console('Please enter keyword to search',2);
	return;
}
if(ip.value.indexOf(',')!=-1) {
	print2console('Comma not allowed for keywords',2);
	return;
}
var lst=ip.value.split(' AND ');
var lst2=[];
for(var i=0; i<lst.length; i++) {
	if(lst[i].length>0) {
		if(lst[i].search(/\S/)!=-1) {
			var b=lst[i].replace(/\s/g,'');
			if(b.length==1) {
				print2console('Keyword can\'t be just one character',2);
				return;
			}
			lst2.push(lst[i]);
		}
	}
}
if(lst2.length==0) {
	print2console('No valid keyword',2);
	return;
}
for(i=0; i<lst2.length; i++) {
	lst2[i]=lst[i].toLowerCase();
}
// list of kws ready

var hitlst=[]; // names

// search for decor by label
for(var tk in bbj.genome.decorInfo) {
	var s=bbj.genome.decorInfo[tk].label.toLowerCase();
	var allmatch=true;
	for(var i=0; i<lst2.length; i++) {
		if(s.indexOf(lst2[i])==-1) {allmatch=false;}
	}
	if(allmatch) {
		hitlst.push(tk);
	}
}

// search for md terms
var mdterms=words2mdterm(lst2); // ele: [term, mdidx]

// search hmtk, both by kw and md
for(var tkn in bbj.genome.hmtk) {
	var o=bbj.genome.hmtk[tkn];
	// label
	var str=o.label.toLowerCase();
	var allmatch=true;
	for(var i=0; i<lst2.length; i++) {
		if(str.indexOf(lst2[i])==-1) { allmatch=false; }
	}
	if(allmatch) {
		hitlst.push(tkn);
		continue;
	}
	// details
	if(o.details) {
		var allmatch=true;
		for(var i=0; i<lst2.length; i++) {
			var thismatch=false;
			for(var x in o.details) {
				var str=o.details[x].toLowerCase();
				if(str.indexOf(lst2[i])!=-1) {
					thismatch=true;
					break;
				}
			}
			if(!thismatch) {
				allmatch=false;
			}
		}
		if(allmatch) {
			hitlst.push(tkn);
			continue;
		}
	}
	// geo, only look at 1st kw
	if(o.geolst) {
		var match=false;
		for(var i=0; i<o.geolst.length; i++) {
			if(o.geolst[i].toLowerCase()==lst2[0]) {
				hitlst.push(tkn);
				match=true;
				break;
			}
		}
		if(match) continue;
	}
	// by md
	if(mdterms.length>0) {
		for(i=0; i<mdterms.length; i++) {
			var mdidx=mdterms[i][1];
			var tt=mdterms[i][0];
			if(o.md[mdidx] && (tt in o.md[mdidx])) {
				hitlst.push(tkn);
				break;
			}
		}
	}
}
if(hitlst.length==0) {
	print2console('No tracks found',2);
	return;
}
print2console('Found '+hitlst.length+' track'+(hitlst.length==1?'':'s'),1);
apps.hmtk.bbj=bbj;
bbj.showhmtkchoice({lst:hitlst,context:23});
}



/*** __facet__ for tracks ***/

function facet2pubs()
{
apps.hmtk.main.style.display='none';
gflag.browser=apps.hmtk.bbj;
toggle8_2();
}
function pubs2facet()
{
apps.publichub.main.style.display='none';
gflag.browser=apps.publichub.bbj;
toggle1_2();
}

function mdterm2str(i,t)
{
var v=gflag.mdlst[i];
if(t in v.idx2attr) return v.idx2attr[t];
return t;
}


Browser.prototype.generateTrackselectionLayout=function()
{
if(!this.facet) return;
if(this.facet.dim1.mdidx==null) {
	// uninitiated
	var count=gflag.mdlst.length;
	if(count==0) {
		// no md??
		this.facet.dim1.mdidx=
		this.facet.dim1.term=
		this.facet.dim2.mdidx=
		this.facet.dim2.term=null;
		return;
	}
	if(count==1) {
		this.facet.dim1.mdidx=0;
	} else if(count==2) {
		this.facet.dim1.mdidx=gflag.mdlst[0].tag==literal_imd ? 1 : 0;
	} else {
		for(var i=0; i<count; i++) {
			if(gflag.mdlst[i].tag!=literal_imd) {
				if(this.facet.dim1.mdidx==null) {
					this.facet.dim1.mdidx=i;
				} else {
					this.facet.dim2.mdidx=i;
					break;
				}
			}
		}
	}
	// use 1 root term
	for(var n in gflag.mdlst[this.facet.dim1.mdidx].root) {
		this.facet.dim1.term=n;
		break;
	}
	// dim 2
	if(this.facet.dim2.mdidx!=null) {
		for(var n in gflag.mdlst[this.facet.dim2.mdidx].root) {
			this.facet.dim2.term=n;
			break;
		}
	}
}
this.facet.dim1.dom.innerHTML= mdterm2str(this.facet.dim1.mdidx,this.facet.dim1.term);
this.facet.rowlst=[];
this.facet.collst=[];
if(this.facet.dim2.mdidx==null) {
	// only one criterion applies, make a text tree
	this.facet.swapbutt.style.display='none';
	this.facet.dim2.dom.innerHTML=literal_facet_nouse;
	this.facet.div2.style.display='none';
	this.facet.div1.style.display='block';
	stripChild(this.facet.div1,0);
	var ul=dom_create('ul',this.facet.div1);
	var idx=this.facet.dim1.mdidx;
	for(var cterm in gflag.mdlst[idx].p2c[this.facet.dim1.term]) {
		this.trackselectionoption_onecriteria(cterm,idx,ul);
	}
	return;
}
// two criteria
this.facet.swapbutt.style.display='inline';
this.facet.dim2.dom.innerHTML= mdterm2str(this.facet.dim2.mdidx,this.facet.dim2.term);
this.facet.div2.style.display = "block";
this.facet.div1.style.display = "none";
for(var cterm in gflag.mdlst[this.facet.dim1.mdidx].p2c[this.facet.dim1.term]) {
	this.facet.rowlst.push([cterm, this.facet.dim1.mdidx, '&#8862;']);
}
for(var cterm in gflag.mdlst[this.facet.dim2.mdidx].p2c[this.facet.dim2.term]) {
	this.facet.collst.push([cterm, 0, '&#8862;']);
}
this.generateTrackselectionGrid();
}

Browser.prototype.generateTrackselectionGrid=function()
{
/* for two criteria case
make grid for track selection, each cell corresponds to metadata categories
rerun when criteria changed
*/
var attr2tkset = {};
// key: attr, val: set of track
for(var i=0; i<this.facet.rowlst.length; i++) {
	// skip expanded parent term
	var t=this.facet.rowlst[i];
	if(t[2] == '&#8863;') continue;
	var s = {};
	this.mdgettrack(t[0], this.facet.dim1.mdidx, s);
	attr2tkset[t[0]] = s;
}
for(i=0; i<this.facet.collst.length; i++) {
	var t=this.facet.collst[i];
	if(t[2] == '&#8863;') continue;
	var s = {};
	this.mdgettrack(t[0], this.facet.dim2.mdidx, s);
	attr2tkset[t[0]] = s;
}
var table = this.facet.div2;
if(table.firstChild) {
	stripChild(table.firstChild, 0);
}

var rowvoc=gflag.mdlst[this.facet.dim1.mdidx],
	colvoc=gflag.mdlst[this.facet.dim2.mdidx];
this.facet.rowlst_td=[];
this.facet.collst_td=[];

/** first row **/
var tr = table.insertRow(0);
// one cell for each attribute in facet.collst, vertical canvas
for(var i=0; i<this.facet.collst.length; i++) {
	var colt=this.facet.collst[i];
	/* column header */
	var td = tr.insertCell(-1);
	td.className='facet_colh';
	td.align='center';
	td.vAlign='bottom';
	td.style.paddingBottom = colt[1];
	td.idx=i;
	var color;
	if(!(colt[0] in colvoc.p2c)) {
		// is leaf
		td.style.paddingTop = colt[1] + 17;
		color=colorCentral.foreground;
	} else {
		// not leaf
		td.style.cursor='pointer';
		td.iscolumn=true;
		td.onclick=facettermclick_grid;
		td.onmousedown=facet_header_press;
		if(colt[2]=='&#8862;') {
			// collapsed
			color=colorCentral.foreground;
		} else {
			color='#858585';
			td.style.borderColor='transparent';
		}
	}
	td.onmouseover=facet_colh_mover;
	td.onmouseout=facet_colh_mout;

	var c = makecanvaslabel({str:mdterm2str(this.facet.dim2.mdidx,colt[0]),
		color:color,bottom:true});
	td.appendChild(c);

	var d=dom_create('div',td);
	if(colt[0] in colvoc.p2c) {
		d.innerHTML=colt[2];
		d.style.color=color;
	} else {
		d.style.width=d.style.height=15;
	}
	this.facet.collst_td.push(td); // for highlight
}
var td = tr.insertCell(-1);
td.align='left';
td.vAlign='bottom';
td.className='facet_cell';
td.style.padding='10px';
td.addEventListener('mouseover', menu_hide, false);

// remaining rows, one for each attribute in facet.rowlst
for(i=0; i<this.facet.rowlst.length; i++) {
	// make first cell, the row header
	var rowt=this.facet.rowlst[i];
	tr = table.insertRow(-1);
	// facet cells
	for(var j=0; j<this.facet.collst.length; j++) {
		td = tr.insertCell(-1);
		var what2 = this.facet.collst[j][0];
		if(!(rowt[0] in attr2tkset) || !(what2 in attr2tkset)) {
			// to skip expanded row and column
			continue;
		}
		var intersection = {};
		for(var tk in attr2tkset[rowt[0]]) {
			if(tk in attr2tkset[what2])
				intersection[tk] = 1;
		}
		td.className='facet_cell';
		td.ridx=i;
		td.cidx=j;
		var num = this.tracksetTwonumbers(intersection);
		if(num[0] == 0) {
			td.innerHTML = '<span style="color:#ccc;">n/a</span>';
		} else {
			var d=dom_create('div',td,'display:inline-block;');
			d.className='tscell';
			d.i=i;
			d.j=j;
			d.term1=rowt[0];
			d.term2=what2;
			d.title='click to show tracks';
			d.onmouseover=facet_cellmover;
			d.onmouseout=facet_cellmout;
			d.onclick=facet_clickcell;
			d.innerHTML = 
				((num[1]==0) ? '<span>0</span>' : '<span class=r>'+num[1]+'</span>')+
				'<span>/</span>' +
				'<span class=g>'+ num[0] + '</span>';
		}
	}
	/* row header */
	td = tr.insertCell(-1);
	td.style.paddingLeft = rowt[1];
	td.className='facet_rowh';
	td.idx=i;
	var tns = mdterm2str(this.facet.dim1.mdidx,rowt[0]);
	if(!(rowt[0] in rowvoc.p2c)) {
		// is leaf
		td.innerHTML=tns;
		td.style.paddingLeft = rowt[1] + 17;
	} else {
		// not leaf
		td.innerHTML=rowt[2]+' '+tns;
		td.iscolumn=false;
		td.onclick=facettermclick_grid;
		td.onmousedown=facet_header_press;
		td.style.cursor='pointer';
		if(rowt[2]!='&#8862;') {
			// expanded
			td.style.borderColor='transparent';
			td.style.color='#858585';
		}
	}
	td.onmouseover=facet_rowh_mover;
	td.onmouseout=facet_rowh_mout;
	this.facet.rowlst_td.push(td);
}
}

function facet_header_press(event) 
{
var t=event.target;
if(t.tagName!='TD') {t=t.parentNode;}
t.style.backgroundColor='rgba(255,255,100,0.5)';
}

Browser.prototype.facet_swap=function()
{
var f=this.facet;
if(f.dim2.mdidx==null) return;
var a=f.dim2.mdidx,
	b=f.dim2.term,
	c=f.dim2.dom.innerHTML;
f.dim2.mdidx=f.dim1.mdidx;
f.dim2.term=f.dim1.term;
f.dim2.dom.innerHTML=f.dim1.dom.innerHTML;
f.dim1.mdidx=a;
f.dim1.term=b;
f.dim1.dom.innerHTML=c;
this.generateTrackselectionLayout();
}

Browser.prototype.tracksetTwonumbers=function(tkset)
{
// takes in a hash of track names
// return a list [total number, number displayed now]
var numall = 0; // # tracks in tkset
var numinuse = 0; // # tracks in tkset in display
for(var tk in tkset) {
	numall++;
	if(this.findTrack(tk)!=null) numinuse++;
}
return [numall, numinuse];
}

Browser.prototype.trackselectionoption_onecriteria=function(term,idx,ul)
{
// one criterion, initial
var voc=gflag.mdlst[idx];
var isLeaf = !(term in voc.p2c);
// count tracks annotated to this term
var tkset = {};
this.mdgettrack(term, idx, tkset);
var num = this.tracksetTwonumbers(tkset);
var li=dom_create('li',ul);
if(isLeaf) {
	dom_addtext(li,((term in voc.idx2attr)? voc.idx2attr[term] : term)+'&nbsp;');
} else {
	li.idx=idx;
	li.term=term;
	var s=dom_addtext(li,'<span>&#8862;</span> '+term+'&nbsp;',null,'clb');
	s.addEventListener('click',toggle32,false);
}
if(num[0] == 0) {
	dom_addtext(li,'n/a',colorCentral.foreground_faint_3);
} else {
	var d=dom_create('div',li,'display:inline-block;');
	d.className='tscell';
	d.term1=term;
	d.idx=idx;
	d.addEventListener('click',facet_clickcell,false);
	d.title='click to show tracks';
	d.innerHTML= 
		((num[1]==0) ? '<span>0</span>' : '<span class=r>'+num[1]+'</span>')+
		'<span>/</span>' +
		'<span class=g>'+ num[0] + '</span>';
}
if(!isLeaf) {
	dom_create('ul',ul).style.display='none';
}
}

function toggle32(event)
{
/* called by clicking on <span> within <li>
for facet, one criterion state
<li> should have <ul> as its next sibling
*/
var li=event.target;
while(li.tagName!='LI') {li=li.parentNode;}
var span = li.firstChild.firstChild;
var ul = li.nextSibling;
if(ul.tagName != 'UL') {
	fatalError('toggle32: could not find UL as next sibling');
}
var hidden = ul.style.display == 'none';
var term = li.term;
var p2c=gflag.mdlst[li.idx].p2c;
if(hidden) {
	for(var cterm in p2c[term]) {
		apps.hmtk.bbj.trackselectionoption_onecriteria(cterm,li.idx,ul);
	}
	ul.style.display = "block";
	span.innerHTML = '&#8863;';
} else {
	stripChild(ul, 0);
	ul.style.display = "none";
	span.innerHTML = '&#8862;';
}
}

function facet_cellmover(event)
{
// i/j: array idx to facet.rowlst, .collst
var d=event.target;
if(d.tagName!='DIV') {d=d.parentNode;}
var f=apps.hmtk.bbj.facet;
var t = f.rowlst_td[d.i];
t.style.backgroundColor = colorCentral.hl;
t = f.collst_td[d.j];
t.style.backgroundColor=colorCentral.hl;
menu.style.display='none';
}
function facet_cellmout(event)
{
var d=event.target;
if(d.tagName!='DIV') {d=d.parentNode;}
var f=apps.hmtk.bbj.facet;
var t = f.rowlst_td[d.i];
t.style.backgroundColor="transparent";
t = f.collst_td[d.j];
t.style.backgroundColor="transparent";
}
function facet_colh_mover(event)
{
var td=event.target;
while(td.tagName!='TD') { td=td.parentNode; }
td.style.backgroundColor = colorCentral.hl;
menu_shutup();
menu.facetm.style.display='block';
var p=absolutePosition(td);
menu_show(9,p[0]-document.body.scrollLeft-10,p[1]-70-document.body.scrollTop);
gflag.menu.termname = apps.hmtk.bbj.facet.collst[td.idx][0];
gflag.menu.mdidx=apps.hmtk.bbj.facet.dim2.mdidx;
}
function facet_colh_mout(event)
{
var td=event.target;
while(td.tagName!='TD') { td=td.parentNode; }
td.style.backgroundColor="transparent";
// don't call menu_hide(), can't let cursor move from td to menu
}
function facet_rowh_mover(event)
{
var td=event.target;
while(td.tagName!='TD') { td=td.parentNode; }
td.style.backgroundColor=colorCentral.hl;
menu_shutup();
menu.facetm.style.display='block';
var p = absolutePosition(td);
menu_show(9, p[0]+td.clientWidth-10-document.body.scrollLeft, p[1]-10-document.body.scrollTop);
gflag.menu.termname = apps.hmtk.bbj.facet.rowlst[td.idx][0];
gflag.menu.mdidx=apps.hmtk.bbj.facet.dim1.mdidx;
}
function facet_rowh_mout(event)
{
var td=event.target;
while(td.tagName!='TD') { td=td.parentNode; }
td.style.backgroundColor="transparent";
}
function facettermclick_grid(event)
{
var bbj=apps.hmtk.bbj;
var td=event.target;
while(td.tagName!='TD') { td=td.parentNode; }
var voc=gflag.mdlst[td.iscolumn ? bbj.facet.dim2.mdidx : bbj.facet.dim1.mdidx];
var termarray= td.iscolumn ? bbj.facet.collst : bbj.facet.rowlst;
var term=termarray[td.idx];
if(term[2] == '&#8862;') {
	// expand details, insert child terms into array
	term[2] = '&#8863;';
	var j=1;
	for(var cterm in voc.p2c[term[0]]) {
		termarray.splice(td.idx+j, 0, [cterm, term[1]+20, '&#8862;']);
		j++;
	}
} else {
	// hide details, remove child terms from array
	term[2] = '&#8862;';
	var lst = [];
	bbj.genome.mdvGetallchild(term[0], voc.p2c, lst);
	var i=0;
	while(true) {
		if(thinginlist(termarray[i][0], lst)) {
			termarray.splice(i, 1);
		} else {
			i++;
		}
		if(i==termarray.length) break;
	}
}
bbj.generateTrackselectionGrid();
}

function facet_dimension_show(event)
{
var s=event.target;
menu_blank();
var table=dom_create('table',menu.c32,'margin:10px;border-top:solid 1px #ededed;');
table.cellPadding=5;
// root terms from all md objects
var bbj=apps.hmtk.bbj;
for(var i=0; i<gflag.mdlst.length; i++) {
	var v=gflag.mdlst[i];
	for(var t in v.root) {
		// equal to itself?
		if(s.isrow && i==bbj.facet.dim1.mdidx && t==bbj.facet.dim1.term) continue;
		if(!s.isrow && i==bbj.facet.dim2.mdidx && t==bbj.facet.dim2.term) continue;
		if(!s.isrow) {
			// escape dim1 term
			if(i==bbj.facet.dim1.mdidx && t==bbj.facet.dim1.term) continue;
		}
		var tr=table.insertRow(-1);
		var td=tr.insertCell(0);
		dom_addtext(td,t,null,'mdt_box').onclick=facet_choosedim_closure(bbj,i,t,s.isrow);
		td=tr.insertCell(1);
		td.style.fontSize='70%';
		td.style.opacity=.7;
		if(v.tag==literal_imd) {
			td.innerHTML='internal';
		} else if(v.source) {
			td.innerHTML='private<br>'+v.source;
		} else if(v.sourceurl) {
			td.innerHTML='shared<br>'+v.sourceurl;
		}
	}
}
if(!s.isrow && bbj.facet.dim2.term!=null) {
	menu.c4.style.display='block';
}
menu_show_beneathdom(s.isrow?4:5,s);
}

function facet_choosedim_closure(bbj,i,t,isrow)
{
return function(){bbj.facet_choosedim(i,t,isrow);};
}

Browser.prototype.facet_choosedim=function(mdidx,term,isrow)
{
if(isrow) {
	this.facet.dim1.mdidx=mdidx;
	this.facet.dim1.term=term;
	this.facet.dim1.dom.innerHTML=mdterm2str(mdidx,term);
	// may need to turm off dim2
	if(mdidx==this.facet.dim2.mdidx && term==this.facet.dim2.term) {
		this.facet.dim2.term=this.facet.dim2.mdidx=null;
		this.facet.dim2.dom.innerHTML=literal_facet_nouse;
	}
} else {
	this.facet.dim2.mdidx=mdidx;
	this.facet.dim2.term=term;
	this.facet.dim2.dom.innerHTML=mdterm2str(mdidx,term);
}
menu_hide();
apps.hmtk.bbj.generateTrackselectionLayout();
}

function facet_clickcell(event)
{
/* called by clicking on a number pair g/r in facet list or grid
and show the list of tracks in menu.facettklsttable
*/
var div=event.target;
if(div.tagName!='DIV') {div=div.parentNode;}
var term1=div.term1;
if(term1==null) return;
var term2=div.term2;
var bbj=apps.hmtk.bbj;
var tkset1 = {};
bbj.mdgettrack(term1, bbj.facet.dim1.mdidx, tkset1);
if(term2) {
	// second term available, from double criteria
	// can both be big grid, or sub-table which is also a grid
	var tkset2 = {};
	bbj.mdgettrack(term2, bbj.facet.dim2.mdidx, tkset2);
	var intersection = {};
	for(var tk in tkset1) {
		if(tk in tkset2) {
			intersection[tk] = 1;
		}
	}
	tkset1 = intersection;
}
gflag.tsp.invoke={
	cell:div,
	};
var tkselectionlst = [];
for(var tk in tkset1) {
	tkselectionlst.push(tk);
}
if(tkselectionlst.length == 0) {
	return;
}
var pos=absolutePosition(div);
bbj.showhmtkchoice({lst:tkselectionlst, 
	x:pos[0]+div.clientWidth-6-document.body.scrollLeft,
	y:pos[1]-10-document.body.scrollTop,
	context:10,
	});
}


function dom_addtkentry(domtype,holder,shown,obj,showname,callback,charlimit)
{
/* can also be used to show gene set
args:
domtype: 1 for <td>, 2 for <div>
holder:
shown: boolean
obj: will be null for gene set
showname: in case of weaving, will show genome name together with label
callback: optional
charlimit: optional
*/
var ent;
switch(domtype) {
case 1:
	ent=holder.insertCell(-1);
	break;
case 2:
	ent=dom_create('div',holder);
	break;
default:
	ent=dom_create('span',holder);
	break;
}
ent.tkobj=obj;
if(shown) {
	ent.className='tkentry_inactive';
} else {
	ent.className='tkentry';
	if(callback) ent.onclick=callback;
}
if(charlimit==undefined) charlimit=30;
if(showname.length>=charlimit+5) {
	ent.innerHTML=showname.substr(0,charlimit)+'...';
	ent.title=showname;
} else {
	ent.innerHTML=showname;
}
return ent;
}

Browser.prototype.showhmtkchoice=function(p)
{
/* arg:
.lst: list of tk name or objects
.selected: boolean, if true, all entries are selected by default
.x/.y: x/y position to show menu (no scroll offset!)
.delete: show delete buttons
.call: direct call back
.context: for gflag.menu.context, if .call is not provided
.allactive: if true, make all tk available for selection
*/
var bbj=this;
if(apps.hmtk && apps.hmtk.main.style.display!='none') {
	// cover the facet panel
	invisible_shield(apps.hmtk.main);
}
menu.facettklstdiv.submit.count=0;
menu.facettklstdiv.submit.style.display='none';
// adjust list order, put tk first that are on show
var lst1=[], lst2=[];
for(var i=0; i<p.lst.length; i++) {
	var n=p.lst[i];
	if(typeof(n)=='string') {
		var t=this.findTrack(n);
		if(t) lst1.push(t);
		else lst2.push(n);
	} else {
		if(this.findTrack(n.name,n.cotton)) {
			lst1.push(n);
		} else {
			lst2.push(n);
		}
	}
}
p.lst=lst1.concat(lst2);

menu_shutup();
menu.facettklstdiv.style.display='block';
menu.facettklstdiv.buttholder.style.display=p.hidebuttholder?'none':'block';
if(p.context==undefined) {p.context=0;}
if(p.x!=undefined) {
	menu_show(p.context, p.x, p.y);
} else {
	gflag.menu.context=p.context;
}
var table=menu.facettklsttable;
stripChild(table, 0);
if(p.lst.length <= 8) {
	table.parentNode.style.height = "auto";
	table.parentNode.style.overflowY = "auto";
} else {
	table.parentNode.style.height = "200px";
	table.parentNode.style.overflowY = "scroll";
}
var showremovebutt=false;
for(var i=0; i<p.lst.length; i++) {
	var tk = p.lst[i];
	var tkn, obj;
	if(typeof(tk)=='string') {
		tkn=tk;
		obj=this.genome.getTkregistryobj(tkn);
		if(!obj) {
			print2console('registry object not found for '+tkn, 2);
			continue;
		}
	} else {
		tkn=tk.name;
		obj=tk;
	}
	var tr = table.insertRow(-1);
	var shown=false;
	if(!p.allactive) {
		shown=typeof(tk)!='string';
	}
	var td=dom_addtkentry(1,tr,shown, obj,
		(this.weaver?('('+(obj.cotton?obj.cotton:this.genome.name)+') '):'')+obj.label,
		p.call?p.call:tkentry_click);
	if(shown) {
		showremovebutt=true;
	} else {
		if(p.selected) simulateEvent(td, 'click');
	}
	td = tr.insertCell(-1);
	td.className='tkentrytype';
	td.innerHTML=FT2verbal[obj.ft];
	td=tr.insertCell(-1);
	td.innerHTML='&nbsp;&#8505;&nbsp;';
	td.className='clb';
	td.onclick=tkinfo_show_closure(bbj,obj);
	if(p.delete) {
		td=tr.insertCell(-1);
		dom_addbutt(td,'delete',menu_delete_custtk).tkname=tkn;
	}
}
table.style.display = "block";
menu.facetremovebutt.style.display=showremovebutt?'inline':'none';
}

function menu_delete_custtk(event)
{
// called by pushing butt in 'list all' menu
gflag.menu.bbj.delete_custtk([event.target.tkname]);
menu_custtk_showall();
}

Browser.prototype.delete_custtk=function(names)
{
// permanent removal
var pending=[];
for(var i=0; i<names.length; i++) {
	var t=this.genome.hmtk[names[i]];
	if(!t) {
		print2console('registry object not found: '+names[i],2);
		return;
	}
	if(this.findTrack(names[i])) {
		this.removeTrack([names[i]]);
	}
	if(t.ft==FT_cm_c) {
		var s=t.cm.set;
		if(s.cg_f) pending.push(s.cg_f);
		if(s.cg_r) pending.push(s.cg_r);
		if(s.chg_f) pending.push(s.chg_f);
		if(s.chg_r) pending.push(s.chg_r);
		if(s.chh_f) pending.push(s.chh_f);
		if(s.chh_r) pending.push(s.chh_r);
		if(s.rd_f) pending.push(s.rd_f);
		if(s.rd_r) pending.push(s.rd_r);
	}
	delete this.genome.hmtk[names[i]];
	for(var j=0; j<this.genome.custtk.names.length; j++) {
		if(this.genome.custtk.names[j]==names[i]) {
			this.genome.custtk.names.splice(j,1);
			break;
		}
	}
}
if(pending.length>0) {
	this.delete_custtk(pending);
}
}

function facet_tklst_toggleall(event)
{
/* called by clicking all/none buttons in facet/menu/tklst panel
arg: boolean to tell if check/uncheck all tracks
*/
var tofill=event.target.tofill;
var bbj=apps.hmtk.bbj;
var lst=menu.facettklsttable.firstChild.childNodes;
for(var i=0; i<lst.length; i++) {
	var td=lst[i].firstChild;
	if((td.className=='tkentry' && tofill) || (td.className=='tkentry_onfocus' && !tofill)) {
		simulateEvent(td, 'click');
	}
}
}


function facet_tklst_addSelected()
{
// called by clicking big green butt from the menu
if(menu.facettklstdiv.submit.count==0) return;
var bbj=gflag.menu.bbj;
var lst=menu.facettklsttable.firstChild.childNodes;
var addlst=[];
for(var i=0; i<lst.length; i++) {
	var td=lst[i].firstChild;
	if(td.className=='tkentry_onfocus') {
		var o=duplicateTkobj(td.tkobj);
		o.mode=tkdefaultMode(o);
		addlst.push(o);
	}
}
if(addlst.length==0) return;
menu.facettklstdiv.submit.innerHTML='Working...';
// may add context-specific handling
for(var i=0; i<addlst.length; i++) {
	var oo=bbj.genome.getTkregistryobj(addlst[i].name);
	if(!oo) {
		print2console('registry object not found for '+addlst[i].label,2);
	} else {
		if(oo.defaultmode!=undefined) {
			o.mode=oo.defaultmode;
		}
	}
}
bbj.ajax_addtracks(addlst);
}

function facet_tklst_removeall()
{
// called by clicking button in facet-menu-tklst panel from menu
var bbj=gflag.menu.bbj;
var lst=menu.facettklsttable.firstChild.childNodes;
var rlst=[];
for(var i=0; i<lst.length; i++) {
	var td=lst[i].firstChild;
	if(td.className=='tkentry_inactive') {
		rlst.push(td.tkobj.name);
	}
}
if(rlst.length==0) return;
bbj.removeTrack(rlst);
}

function facet_term_selectall()
{
/* called by clicking 'select all' option in menu
to select all tracks annotated by the underlining term
*/
var bbj=apps.hmtk.bbj;
var s = {};
bbj.mdgettrack(gflag.menu.termname, gflag.menu.mdidx, s);
var newlst = [];
for(var n in s) {
	if(bbj.findTrack(n) == null) {
		newlst.push(n);
	}
}
if(newlst.length==0) {
	menu_hide();
	return;
}
gflag.tsp.invoke={ mdidx:gflag.menu.mdidx };
bbj.showhmtkchoice({lst:newlst, selected:true, context:9});
}
function facet_term_removeall()
{
// called by clicking 'remove all' option in menu
var bbj=apps.hmtk.bbj;
var s = {};
bbj.mdgettrack(gflag.menu.termname, gflag.menu.mdidx, s);
var lst=[];
for(var tk in s) {
	if(bbj.findTrack(tk)!=null) {
		lst.push(tk);
	}
}
if(lst.length==0) return;
bbj.removeTrack(lst);
menu_hide();
}

Browser.prototype.facetclickedcell_remake=function()
{
/* remake single facet cell after updating
tell which cell and context by gflag.tsp.invoke
*/
var bbj=this.trunk?this.trunk:this;
var div=gflag.tsp.invoke.cell;
var s1={};
this.mdgettrack(div.term1,bbj.facet.dim1.mdidx,s1)
var intersection={};
if(div.term2!=undefined) {
	// two term
	var s2={};
	this.mdgettrack(div.term2,bbj.facet.dim2.mdidx,s2)
	for(var tk in s1) {
		if(tk in s2) intersection[tk] = 1;
	}
} else {
	intersection=s1;
}
var num=bbj.tracksetTwonumbers(intersection);
div.innerHTML= ((num[1]==0)?'<span>0</span>':'<span class=r>'+num[1]+'</span>')+
	'<span>/</span>'+
	'<span class=g>'+num[0]+'</span>';
simulateEvent(div,'click');
}


function facet_removeall(event)
{
/* called by pushing butt in facet panel
*/
var bbj=apps.hmtk.bbj;
var cells=bbj.facet.main.getElementsByClassName('tscell');
var tkshown={};
for(var i=0; i<cells.length; i++) {
	if(cells[i].firstChild.className=='r') {
		var s1={};
		bbj.mdgettrack(cells[i].term1,bbj.facet.dim1.mdidx,s1);
		if(cells[i].term2!=undefined) {
			var s2={};
			bbj.mdgettrack(cells[i].term2,bbj.facet.dim2.mdidx,s2);
			var si={};
			for(var n in s2) {
				if(n in s1) {
					si[n]=1;
				}
			}
			s1=si;
		}
		for(var n in s1) {
			tkshown[n]=1;
		}
	}
}
var lst=[];
for(var n in tkshown) {
	lst.push(n);
}
if(lst.length==0) {
	print2console('No tracks are on display from this group.',0);
	return;
}
bbj.removeTrack(lst);
bbj.generateTrackselectionLayout();
}

/*** __facet__ ends ***/




/*** __scalebar__ ***/
function scalebarMout(event) {
// mouse out to hide beam
	var bbj=gflag.browser;
	var ctx = bbj.scalebar.arrow.getContext('2d');
	ctx.strokeStyle = colorCentral.foreground;
	bbj.scalebararrowStroke();
	scalebarbeam.style.display = 'none';
}
function scalebarMover(event)
{
// mouse over to show beam
var bbj=gflag.browser;
var ctx = bbj.scalebar.arrow.getContext('2d');
ctx.strokeStyle = '#f00';
gflag.browser.scalebararrowStroke();
gflag.browser.show_scalebarbeam();
}
Browser.prototype.show_scalebarbeam=function()
{
var s=scalebarbeam;
s.style.display = 'block';
s.style.width=this.scalebar.slider.width;
var pos=absolutePosition(this.scalebar.slider);
s.style.left=pos[0];
s.style.top=pos[1]+this.scalebar.slider.height;
s.style.height=this.tkpanelheight()+(this.rulercanvas?this.rulercanvas.height:0);
}
Browser.prototype.scalebararrowStroke=function()
{
var x = 6;
var ctx = this.scalebar.arrow.getContext('2d');
ctx.clearRect(0,0,20,16);
ctx.beginPath();
ctx.moveTo(x,2);
ctx.lineTo(x,15);
ctx.lineTo(1,12);
ctx.moveTo(x,15);
ctx.lineTo(x*2-1,12);
ctx.stroke();
}
function scalebarSliderMD(event)
{
if(event.button != 0) return;
event.preventDefault();
gflag.browser.scalebar.slider.xstart = event.clientX + document.body.scrollLeft;
gflag.browser.show_scalebarbeam();
gflag.scalebarbbj=gflag.browser;
document.body.addEventListener('mousemove', scalebarSliderM, false);
document.body.addEventListener('mouseup', scalebarSliderMU, false);
scalebarbeam.style.display='block';
}
function scalebarSliderM(event)
{
var bbj=gflag.scalebarbbj;
var s=bbj.scalebar;
var thisx = event.clientX + document.body.scrollLeft;
var oldleft = parseInt(s.slider.style.left);
var newleft = oldleft + thisx - s.slider.xstart;
if(newleft > oldleft) {
	if(newleft > bbj.hmSpan-s.slider.width) {
		newleft = bbj.hmSpan-s.slider.width;
	}
} else if(newleft < oldleft) {
	if(newleft < 0) {
		newleft = 0;
	}
}
s.slider.style.left = newleft;
s.slider.xstart = thisx;
s.says.style.left = newleft - s.says.clientWidth - 3;
s.arrow.style.left = newleft + s.slider.width - 6;
scalebarbeam.style.left = parseInt(scalebarbeam.style.left)+newleft-oldleft;
scalebarbeam.style.display='block';
}
function scalebarSliderMU(event)
{
document.body.removeEventListener('mousemove', scalebarSliderM, false);
document.body.removeEventListener('mouseup', scalebarSliderMU, false);
scalebarbeam.style.display='none';
}
function scalebarArrowMD(event)
{
if(event.button != 0) return;
event.preventDefault();
gflag.browser.scalebar.arrow.xstart = event.clientX + document.body.scrollLeft;
gflag.scalebarbbj=gflag.browser;
document.body.addEventListener('mousemove', scalebarArrowM, false);
document.body.addEventListener('mouseup', scalebarArrowMU, false);
scalebarbeam.style.display='block';
}
function scalebarArrowM(event)
{
var bbj=gflag.scalebarbbj;
var s=bbj.scalebar;
var thisx = event.clientX + document.body.scrollLeft;
var oldleft = parseInt(s.arrow.style.left);
var newleft = oldleft + thisx - s.arrow.xstart;
var oldleft2 = parseInt(s.slider.style.left);
if(newleft > oldleft) {
	if(oldleft2 + s.slider.width + newleft-oldleft > bbj.hmSpan) {
		newleft = bbj.hmSpan;
	}
} else if(newleft < oldleft) {
	if(s.slider.width < oldleft-newleft) {
		newleft = oldleft;
	}
}
s.arrow.style.left = newleft;
s.arrow.xstart = thisx;
s.slider.width += newleft - oldleft;
bbj.drawScalebarSlider();
bbj.scalebarSlider_fill();
scalebarbeam.style.width = s.slider.width;
scalebarbeam.style.display='block';
}
function scalebarArrowMU(event)
{
document.body.removeEventListener('mousemove', scalebarArrowM, false);
document.body.removeEventListener('mouseup', scalebarArrowMU, false);
scalebarbeam.style.display='none';
}
Browser.prototype.drawScalebarSlider=function()
{
var ctx = this.scalebar.slider.getContext('2d');
ctx.fillRect(0,3,1,this.scalebar.slider.height-5);
ctx.fillRect(0,8,this.scalebar.slider.width,1);
}
Browser.prototype.scalebarSlider_fill=function()
{
if(!this.scalebar || !this.scalebar.slider) return;
var bp=this.pixelwidth2bp(this.scalebar.slider.width);
this.scalebar.says.innerHTML = bp>10 ? parseInt(bp) : bp.toFixed(1);
this.scalebar.says.style.left = parseInt(this.scalebar.slider.style.left) - this.scalebar.says.clientWidth - 3;
}
/*** __scalebar__ ends ***/



/* __pan__ */


Browser.prototype.placeMovable=function(cleft)
{
/* when running gsv with a small number of items
entire.spnum will be smaller than hmspan
*/
if(!this.hmdiv) return;
if(cleft > 0) {
	cleft = 0;
} else if(cleft<0 && (cleft<this.hmSpan-this.entire.spnum)) {
	cleft = this.hmSpan - this.entire.spnum;
}
this.move.styleLeft=cleft;
if(this.decordiv) this.decordiv.style.left=cleft;
if(this.hmdiv) this.hmdiv.style.left=cleft;
if(this.ideogram && this.ideogram.canvas) this.ideogram.canvas.parentNode.style.left=cleft;
if(this.rulercanvas) this.rulercanvas.style.left = cleft;
}

function viewboxMD(event)
{
if(event.button != 0) return;
event.preventDefault();
var bbj=gflag.browser;
if(bbj.entire.spnum <= bbj.hmSpan) {
	/* don't move if entire.spnum is smaller than hmspan
	this is the case of running gsv with small # of items
	but need to issue 'clicking' event
	*/
	bbj.move.oldpos = bbj.move.styleLeft; // this must be set equal or else click won't work
	track_click(event);
	return;
}
// initiate move
pica_hide();

if(pica.tk.ft==FT_weaver_c && pica.tk.weaver.mode==W_rough) {
	/* if pressing cursor on the query band of rough weavertk,
	will issue zoom in
	*/
	var pos=absolutePosition(pica.tk.canvas);
	if(event.clientY+document.body.scrollTop-absolutePosition(pica.tk.canvas)[1]>pica.tk.qtc.height) {
		var x=event.clientX+document.body.scrollLeft-absolutePosition(bbj.hmdiv.parentNode)[0]-bbj.move.styleLeft;
		for(var i=0; i<pica.tk.weaver.stitch.length; i++) {
			var stc=pica.tk.weaver.stitch[i];
			if(x>=stc.canvasstart && x<=stc.canvasstop) {
				bbj.init_zoomin(event.clientX,stc);
				return;
			}
		}
	}
}

document.body.addEventListener("mousemove", viewboxM, false);
document.body.addEventListener("mouseup", viewboxMU, false);
gflag.movebbj=bbj;
bbj.move.oldpos = bbj.move.styleLeft;
bbj.move.oldx=
bbj.move.mousex = event.clientX;
}

function viewboxM(event)
{
var bbj=gflag.movebbj;
bbj.shieldOn();
if(bbj.entire.atbplevel) {
	// escape move distance that is smaller than bpwidth
	var moved = event.clientX - bbj.move.mousex;
	if(Math.abs(moved) >= bbj.entire.bpwidth) {
		var s=parseInt(moved/bbj.entire.bpwidth)*bbj.entire.bpwidth;
		bbj.placeMovable(bbj.move.styleLeft+s);
		bbj.move.mousex = event.clientX;
		if(!bbj.is_gsv()) {
			bbj.updateDspstat();
			if(gflag.syncviewrange) {
				var lst=gflag.syncviewrange.lst;
				for(var i=0; i<lst.length; i++) {
					lst[i].placeMovable(lst[i].move.styleLeft+s);
					lst[i].updateDspstat();
				}
			}
		}
	}
	return;
}
var s=event.clientX-bbj.move.mousex;
bbj.placeMovable(bbj.move.styleLeft+s);
bbj.move.mousex = event.clientX;
if(!bbj.is_gsv()) {
	bbj.updateDspstat();
	if(gflag.syncviewrange) {
		var lst=gflag.syncviewrange.lst;
		for(var i=0; i<lst.length; i++) {
			lst[i].placeMovable(lst[i].move.styleLeft+s);
			lst[i].updateDspstat();
		}
	}
}
}

function viewboxMU()
{
/*
move left: scroll to right, newly exposed regions on left
move right: scroll to left, newly exposed regions on right

if at leisure, must not forget to label all bam reads
so that they can escape clipping processing
*/
var bbj=gflag.movebbj;
if(bbj.move.mousex==bbj.move.oldx) {
	document.body.removeEventListener("mousemove", viewboxM, false);
	document.body.removeEventListener("mouseup", viewboxMU, false);
	bbj.shieldOff();
	return;
}
bbj.move.direction = null;
var sylst=null;
if(gflag.syncviewrange) sylst=gflag.syncviewrange.lst;
for(var i=0; i<bbj.tklst.length; i++) {
	var t=bbj.tklst[i];
	if(t.ft==FT_bam_n || t.ft==FT_bam_c) {
		for(var j=0; j<t.data.length; j++) {
			for(var k=0; k<t.data[j].length; k++) {
				t.data[j][k].existbeforepan=true;
			}
		}
	}
}
if(bbj.atLeftBorder() && bbj.atRightBorder()) {
	// at leisure
	bbj.render_update();
	if(sylst) {
		for(var i=0; i<sylst.length; i++) {
			sylst[i].render_update();
		}
	}
	if(bbj.onupdatex) { bbj.onupdatex(bbj); }
} else if(bbj.move.styleLeft > bbj.move.oldpos) {
	/*** drag canvas to right ***/
	/* see if number of summary points beyond move.styleLeft is below hmSpan */
	if(-bbj.move.styleLeft <= bbj.hmSpan) {
		if(bbj.atLeftBorder()) {
			// at leisure
			bbj.render_update();
			if(sylst) {
				for(var i=0; i<sylst.length; i++) {
					sylst[i].render_update();
				}
			}
			if(bbj.onupdatex) { bbj.onupdatex(bbj); }
		} else {
			// request data
			bbj.move.direction = 'l';
			var moveSize = bbj.move.styleLeft - bbj.move.oldpos;
			var moveDist;
			if(bbj.entire.atbplevel) {
				moveDist = parseInt(moveSize/bbj.entire.bpwidth);
			} else {
				moveDist = parseInt(moveSize * bbj.entire.summarySize);
			}
			var param=bbj.displayedRegionParamMove()+'&summarySize='+moveSize+'&distance='+moveDist+'&move='+bbj.move.direction+(bbj.entire.atbplevel?'&atbplevel=on':'')+bbj.mayShowDsp();
			bbj.cloak();
			bbj.ajaxX(param);
			if(sylst) {
				for(var i=0; i<sylst.length; i++) {
					var b=sylst[i];
					b.move.direction='l';
					b.ajaxX(param);
				}
			}
		}
	} else {
		// at leisure, there's still spare space on left, no ajax
		bbj.render_update();
		if(sylst) {
			for(var i=0; i<sylst.length; i++) {
				sylst[i].render_update();
			}
		}
		if(bbj.onupdatex) { bbj.onupdatex(bbj); }
	}
} else if(bbj.move.styleLeft < bbj.move.oldpos) {
	/*** drag canvas to left ***/
	/* see if number of summary points beyond hmSpan-move.styleLeft is below hmSpan */
	if(bbj.entire.spnum-(bbj.hmSpan-bbj.move.styleLeft) <= bbj.hmSpan) {
		if(bbj.atRightBorder()) {
			// at leisure
			bbj.render_update();
			if(sylst) {
				for(var i=0; i<sylst.length; i++) {
					sylst[i].render_update();
				}
			}
			if(bbj.onupdatex) { bbj.onupdatex(bbj); }
		} else {
			// request data
			bbj.move.direction = 'r';
			var moveSize = bbj.move.oldpos - bbj.move.styleLeft;
			var moveDist;
			if(bbj.entire.atbplevel)
				moveDist = parseInt(moveSize/bbj.entire.bpwidth);
			else
				moveDist = parseInt(moveSize*bbj.entire.summarySize);
			var param=bbj.displayedRegionParamMove()+'&summarySize='+moveSize+'&distance='+moveDist+'&move='+bbj.move.direction+(bbj.entire.atbplevel?'&atbplevel=on':'')+bbj.mayShowDsp();
			bbj.cloak();
			bbj.ajaxX(param);
			if(sylst) {
				for(var i=0; i<sylst.length; i++) {
					var b=sylst[i];
					b.move.direction='r';
					b.ajaxX(param);
				}
			}
		}
	} else {
		// at leisure, no ajax
		bbj.render_update();
		if(sylst) {
			for(var i=0; i<sylst.length; i++) {
				sylst[i].render_update();
			}
		}
		if(bbj.onupdatex) { bbj.onupdatex(bbj); }
	}
}
document.body.removeEventListener("mousemove", viewboxM, false);
document.body.removeEventListener("mouseup", viewboxMU, false);
bbj.shieldOff();
}

Browser.prototype.render_update=function()
{
// at the end of panning and no ajax fired
this.updateDspBoundary();
this.drawTrack_browser_all();
this.drawIdeogram_browser();
this.drawNavigator();
/* 5/13/14 do not issue drawing for cottonbbj here
since that will be issued following drawing the weavertk
*/
}

Browser.prototype.mayShowDsp=function()
{
/* at thin/full mode, must not do dsp filtering
*/
var show=false;
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if((t.ft==FT_lr_c||t.ft==FT_lr_n) && (t.mode==M_trihm||t.mode==M_arc)) {
		show=true;break;
	}
}
if(!show) return '';
var lst=[];
for(i=this.dspBoundary.vstartr; i<=this.dspBoundary.vstopr; i++) {
	var r=this.regionLst[i];
	lst.push(r[0]);
	lst.push(r[3]);
	lst.push(r[4]);
}
return '&existingDsp='+lst.join(',');
}

Browser.prototype.arrowPan=function(direction, fold)
{
// pan over cached region by clicking arrow button
var sp2pan=parseInt(fold*this.hmSpan);
if(direction=='l') {
	sp2pan=Math.min(-this.move.styleLeft, sp2pan);
} else {
	sp2pan=Math.min(sp2pan, this.entire.spnum+this.move.styleLeft-this.hmSpan);
}
if(sp2pan<=0) return;
this.move.direction=direction;
// don't call simulate viewboxMD(event) as cursor x will disrupt
gflag.movebbj=this;
this.move.oldpos=this.move.styleLeft;
this.move.oldx= this.move.mousex =500;
gflag.arrowpan={bbj:this,span:sp2pan,dir:direction};
arrowPan_do();
invisible_shield(document.body);
}

function arrowPan_do()
{
var a=gflag.arrowpan;
if(a.span<=0) {
	viewboxMU();
	invisibleBlanket.style.display='none';
	return;
}
a.bbj.move.styleLeft+=a.dir=='l'?3:-3;
a.bbj.move.mousex=600;
a.bbj.placeMovable(a.bbj.move.styleLeft);
a.span-=3;
setTimeout(arrowPan_do, 1);
}

/* __pan__ ends */

/* __zoom__ */

function zoomin_MD(event)
{
event.preventDefault();
gflag.browser.init_zoomin(event.clientX);
}

Browser.prototype.init_zoomin=function(x,stitch)
{
document.body.addEventListener("mousemove", zoomin_M, false);
document.body.addEventListener("mouseup", zoomin_MU, false);
indicator2.style.display = "block";
indicator2.leftarrow.style.display = "block";
indicator2.rightarrow.style.display = "block";
this.shieldOn();
var pos=absolutePosition(this.hmdiv.parentNode);
indicator2.style.left = x+document.body.scrollLeft;
indicator2.style.top = pos[1];
var th = this.tkpanelheight();
indicator2.style.height = th;
indicator2.leftarrow.style.top = th/2-indicator2.leftarrow.height/2;
indicator2.rightarrow.style.top = indicator2.leftarrow.style.top;
indicator2.style.width=0;
gflag.zoomin={
	oldx:x,
	x:x+document.body.scrollLeft,
	holderx:pos[0],
	beyondfinest:false,
	bbj:this,
	stitch:stitch,
	};
}
function zoomin_M(event)
{
// mouse move, only process horizontal move
var z=gflag.zoomin;
var currx = event.clientX + document.body.scrollLeft;
var bpw=0;
if(currx > z.x) {
	if(currx < z.holderx+(z.stitch?z.stitch.canvasstop+z.bbj.move.styleLeft:z.bbj.hmSpan)) {
		var pxw=currx - z.x;
		indicator2.style.width=pxw;
		bpw=z.bbj.pixelwidth2bp(pxw);
		if(bpw<z.bbj.hmSpan/MAXbpwidth_bold){
			indicator2.veil.style.backgroundColor='red';
			z.beyondfinest=true;
		} else {
			indicator2.veil.style.backgroundColor='blue';
			z.beyondfinest=false;
		}
	}
} else {
	if(currx > z.holderx+(z.stitch?z.stitch.canvasstart+z.bbj.move.styleLeft:0)) {
		var pxw = z.x - currx;
		indicator2.style.width = pxw;
		indicator2.style.left = currx;
		bpw=z.bbj.pixelwidth2bp(pxw);
		if(bpw<z.bbj.hmSpan/MAXbpwidth_bold) {
			indicator2.veil.style.backgroundColor='red';
			z.beyondfinest=true;
		} else {
			indicator2.veil.style.backgroundColor='blue';
			z.beyondfinest=false;
		}
	}
}
indicator2.veil.firstChild.firstChild.firstChild.innerHTML='';
if(bpw!=0) {
	var str=parseInt(bpw)+' bp';
	if(parseInt(indicator2.style.width)>(str.length*15)) {
		indicator2.veil.firstChild.firstChild.firstChild.innerHTML=str;
	}
}
}
function zoomin_MU(event)
{
indicator2.style.display = "none";
indicator2.leftarrow.style.display = "none";
indicator2.rightarrow.style.display = "none";
document.body.removeEventListener("mousemove", zoomin_M, false);
document.body.removeEventListener("mouseup", zoomin_MU, false);
if(bbjisbusy()) return;
var z=gflag.zoomin;
z.bbj.shieldOff();
if(event.clientX==z.oldx) return;
if(z.beyondfinest) return;
indicator2.veil.firstChild.firstChild.firstChild.innerHTML='';
var x1=parseInt(indicator2.style.left)-z.holderx;
var x2=x1+parseInt(indicator2.style.width);
if(z.stitch) {
	x1-=z.bbj.move.styleLeft;
	x2-=z.bbj.move.styleLeft;
	var chr2pos={};
	for(var i=0; i<z.stitch.lst.length; i++) {
		var h=z.stitch.lst[i];
		var w=h.targetstop-h.targetstart;
		var a=b=-1;
		if(h.strand=='+') {
			if(Math.max(h.q1,x1)<Math.min(h.q2,x2)) {
				a=h.targetstart+parseInt((Math.max(x1,h.q1)-h.q1)*w/(h.q2-h.q1));
				b=h.targetstop-parseInt((h.q2-Math.min(x2,h.q2))*w/(h.q2-h.q1));
			}
		} else {
			if(Math.max(h.q2,x1)<Math.min(h.q1,x2)) {
				a=h.targetstart+parseInt((h.q1-Math.min(x2,h.q1))*w/(h.q1-h.q2));
				b=h.targetstop-parseInt((Math.max(x1,h.q2)-h.q2)*w/(h.q1-h.q2));
			}
		}
		if(a!=-1) {
			var c=z.bbj.regionLst[h.targetrid][0];
			if(c in chr2pos) {
				chr2pos[c][0]=Math.min(a,chr2pos[c][0]);
				chr2pos[c][1]=Math.max(b,chr2pos[c][1]);
			} else {
				chr2pos[c]=[a,b];
			}
		}
	}
	var maxlen=0, maxchr;
	for(var n in chr2pos) {
		var a=chr2pos[n][1]-chr2pos[n][0];
		if(a>maxlen) {
			maxchr=n;
			maxlen=a;
		}
	}
	z.bbj.weavertoggle(maxlen);
	z.bbj.cgiJump2coord(maxchr+':'+chr2pos[maxchr][0]+'-'+chr2pos[maxchr][1]);
	return;
}
z.bbj.ajaxZoomin(x1, x2,true);
}

function start_animate_zoom(hrx)
{
var z=gflag.animate_zoom[hrx];
var bbj=horcrux[hrx];
bbj.shieldOn();
z.xzoom=1;
z.xleft=bbj.move.styleLeft;
// total # of frame in the little film
z.count=Math.min(Math.ceil(bbj.hmSpan/(z.x2-z.x1)),10)*10;
// change scale in each frame
if(z.zoomin) {
	z.foldchange=bbj.hmSpan/(z.x2-z.x1)-1;
} else {
	z.foldchange=(z.x2-z.x1)/bbj.hmSpan-1;
}
z.foldchange/=z.count;
// x offset adjustment
var c0=(z.x2+z.x1)/2-bbj.move.styleLeft;
var c1=bbj.entire.spnum/2;
z.x_shift=(c1-c0)*z.foldchange+((bbj.hmSpan-z.x1-z.x2)/2)/z.count;
// TODO .style.left
run_animate_zoom(hrx);
}

function run_animate_zoom(hrx)
{
var z=gflag.animate_zoom[hrx];
var bbj=horcrux[hrx];
if(z.count<=0) {
	may_drawbrowser_afterzoom(hrx);
	return;
}
bbj.zoom_dom_movable(z.xzoom,z.xleft);
z.xzoom+=z.foldchange;
z.xleft+=z.x_shift;
z.count--;
setTimeout('run_animate_zoom('+hrx+')',5);
}

Browser.prototype.zoom_dom_movable=function(v,x)
{
// for animated zoom
var r=this.rulercanvas;
if(r!=null) {
	r.style.webkitTransform=
	r.style.mozTransform=
	r.style.transform= 'scale('+v+',1)';
	r.style.left=x;
}
/* do not change ideogram, not fixed yet
var d1=this.ideogram.canvas.parentNode.parentNode;
d1.style.webkitTransform=
d1.style.mozTransform=
d1.style.transform=
*/
var d2=this.hmdiv;
var d3=this.decordiv;
d2.style.webkitTransform=
d2.style.mozTransform=
d2.style.transform=
d3.style.webkitTransform=
d3.style.mozTransform=
d3.style.transform= 'scale('+v+',1)';
d2.style.left=d3.style.left=x;
}

function may_drawbrowser_afterzoom(hrx)
{
var bbj=horcrux[hrx];
if(bbj.animate_zoom_stat==1) {
	bbj.cloak();
	// data from ajax not ready yet
	setTimeout('may_drawbrowser_afterzoom('+hrx+')',100);
	return;
}
bbj.zoom_dom_movable(1,bbj.move.styleLeft);
bbj.drawRuler_browser(false);
bbj.drawTrack_browser_all();
bbj.drawIdeogram_browser(false);
bbj.unveil();
bbj.shieldOff();
}


function browser_zoomin(event)
{
var t=event.target;
if(!t.fold) t=t.parentNode;
gflag.browser.cgiZoomin(t.fold);
}
function browser_zoomout(event)
{
var t=event.target;
if(!t.fold) t=t.parentNode;
gflag.browser.clicked_zoomoutbutt=t; // for placing warning msg
gflag.browser.cgiZoomout(t.fold,false);
}
function browser_pan(event)
{
gflag.browser.arrowPan(event.target.direction,event.target.fold);
}


Browser.prototype.cgiZoomin=function(howmuch)
{
/* push button zoomin
	hmSpan divided by howmuch to get region to zoom into
*/
var sp = parseInt((this.hmSpan - this.hmSpan/howmuch)/2);
if(sp >= this.hmSpan/2) return;
this.shieldOn();
this.ajaxZoomin(sp, this.hmSpan-sp,true);
}

Browser.prototype.ajaxZoomin=function(x1, x2, animate)
{
/* for dragging on ideogram and clicking zoomin button
x1/x2 are start,stop of selected horizontal position on ideogram, offset to hmdiv left position
but not only chr1:start-stop
 */
if(x1 >= x2) {
	this.shieldOff();
	return;
}
// safeguard not to zoom beyond finest level
if(this.pixelwidth2bp(x2-x1)<this.hmSpan/MAXbpwidth_bold) {
	print2console('At finest level, cannot zoom in',2);
	this.shieldOff();
	return;
}
this.weavertoggle((x2-x1)*this.entire.summarySize);

// seek dsp boundary by user selection
var rl = this.sx2rcoord(x1-this.move.styleLeft);
if(!rl) fatalError('null left point??');
var rr = this.sx2rcoord(x2-this.move.styleLeft);
if(!rr) fatalError('null right point??');
this.dspBoundary={vstartr:rl.rid,
	vstarts:rl.sid,
	vstartc:rl.coord,
	vstopr:rr.rid,
	vstops:rr.sid,
	vstopc:rr.coord};

if(animate) {
	this.animate_zoom_stat=1;
	gflag.animate_zoom[this.horcrux]={
		x1:x1,
		x2:x2,
		zoomin:true,
	};
	start_animate_zoom(this.horcrux);
}
var param= this.displayedRegionParam(rl.coord,rr.coord)+'&imgAreaSelect=on';
this.ajaxX(param);
if(gflag.syncviewrange) {
	var lst=gflag.syncviewrange.lst;
	for(var i=0; i<lst.length; i++) {
		var b=lst[i];
		if(animate) {
			b.animate_zoom_stat=1;
			gflag.animate_zoom[b.horcrux]={
				x1:x1,
				x2:x2,
				zoomin:true,
			};
			start_animate_zoom(b.horcrux);
		}
		b.ajaxX(param);
	}
}
}

Browser.prototype.cgiZoomout=function(howmuch,enforce)
{
/* called by "zoom out" button, so if already meets borders, disable zoom out button
argument: 0.5 for zoom out by 1.5 fold
*/
/* this is not in use as the flanking can hit border..
if(this.atLeftBorder() && this.atRightBorder()) {
	print2console('Cannot zoom out: showing entire range',2);
	return;
}
*/
// a step of alert as required by our dear reviewer
if(!enforce) {
	var tcount=0;
	for(var i=0; i<this.tklst.length; i++) {
		var tk=this.tklst[i];
		if(tk.ft!=FT_matplot && tk.ft!=FT_cm_c && tk.ft!=FT_matplot &&
			!tkishidden(tk) && !isNumerical(tk) && tk.ft!=FT_cat_n && tk.ft!=FT_cat_c) {
			for(var j=0; j<tk.data.length; j++)
				tcount+=tk.data[j].length;
		}
	}
	if(tcount*(howmuch+1)>trackitemnumAlert*2) {
		gflag.zoomout.fold=howmuch;
		menu_shutup();
		menu.zoomoutalert.style.display='block';
		menu.zoomoutalert.count.innerHTML=tcount;
		menu.zoomoutalert.fold.innerHTML=howmuch;
		menu_show_beneathdom(0,this.clicked_zoomoutbutt);
		return;
	}
}
howmuch=parseFloat(howmuch);

this.weavertoggle(this.hmSpan*this.entire.summarySize*(1+howmuch));
this.shieldOn();
this.animate_zoom_stat=1;
var w=this.hmSpan/(1+howmuch);
gflag.animate_zoom[this.horcrux]={
	x1:(this.hmSpan-w)/2,
	x2:(this.hmSpan+w)/2,
	zoomin:false,};
start_animate_zoom(this.horcrux);
var param=this.displayedRegionParam()+"&zoom="+(howmuch/2);
this.ajaxX(param);
// for golden
if(gflag.syncviewrange) {
	var lst=gflag.syncviewrange.lst;
	for(var i=0; i<lst.length; i++) {
		var b=lst[i];
		b.animate_zoom_stat=1;
		var w=b.hmSpan/(1+howmuch);
		gflag.animate_zoom[b.horcrux]={
			x1:(b.hmSpan-w)/2,
			x2:(b.hmSpan+w)/2,
			zoomin:false,};
		start_animate_zoom(b.horcrux);
		b.ajaxX(param);
	}
}
}

function risky_zoomout()
{
// despite warning, user still takes risky move
gflag.menu.bbj.cgiZoomout(gflag.zoomout.fold,true);
menu_hide();
}


/*** __zoom__ ends ***/








/*** __tks__ track select panel ***/

Browser.prototype.decor_invoketksp=function()
{
/* called by clicking grandadd > add decor option, to add decor into main panel
the menu must have already been shown
*/
var d=this.genome.decorInfo;
for(var n in d) {
	if(d[n].tksentry) {
		d[n].tksentry.className='tkentry';
	}
}
// disable decors already in collection
for(var i=0; i<this.tklst.length; i++) {
	var tk=this.tklst[i];
	if(tk.name in d) {
		if(tk.cotton) {
			if(tk.cotton!=this.genome.name) continue;
		}
		// custom tk do not have tksentry
		var ent=d[tk.name].tksentry;
		if(ent) ent.className='tkentry_inactive';
	}
}
menu_shutup();
menu.decorcatalog.style.display='block';
stripChild(menu.decorcatalog,0);
menu.decorcatalog.appendChild(this.genome.tablist_decor);
gflag.menu.context=12;
if(this.weaver && this.weaver.iscotton) {
	stripChild(menu.c32,0);
	menu.c32.style.display='block';
	dom_create('div',menu.c32,'background-color:#858585;color:white;text-align:center;').innerHTML='tracks from '+this.genome.name;
}
}


function decorgrp_click(event)
{
/* clicking decor group tab in tkspanel
event.target is <div> that tab, will switch decor child panels
try to evade use of global_browser
*/
// turn off all grp tabs
var lst=event.target.parentNode.childNodes;
for(var i=0; i<lst.length; i++) {
	lst[i].style.backgroundColor='';
}
// turn off all children panels
lst=event.target.parentNode.parentNode.nextSibling.childNodes;
for(i=0; i<lst.length; i++)
	lst[i].style.display='none';
// turn on the one clicked
event.target.style.backgroundColor=colorCentral.magenta2;
var grp = event.target.getAttribute('grpname');
for(i=0; i<lst.length; i++) {
	if(lst[i].getAttribute('grpname')==grp) {
		lst[i].style.display='block';
		return;
	}
}
}


Browser.prototype.showcurrenttrack4select=function(callback,ft_filter)
{
/* list tracks for selection
* currently displayed
* custom tracks but not those in public hub
* apply ft filter
menu_show must already been called
*/
var lst=[];
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if(t.ft in ft_filter) {
		lst.push(t);
	}
}
if(lst.length==0) {
	menu.c1.style.display='block';
	menu.c1.innerHTML='No tracks available';
	return;
}
this.showhmtkchoice({lst:lst,call:callback,allactive:true,hidebuttholder:true});
}

/*** __tks__ ends ***/



/*** __menu__ context menu ***/
function menu_mover() {document.body.removeEventListener("mousedown",menu_hide,false);}
function menu_mout() {document.body.addEventListener("mousedown",menu_hide,false);}

function menu_appoption(holder,icon,name,desc,callback)
{
var d=dom_create('div',holder);
d.className='menuactivechoice';
d.addEventListener('click',callback,false);
var t=dom_create('table',d,'color:inherit;white-space:nowrap');
var tr=t.insertRow(0);
var td=tr.insertCell(0);
//td.className='appicon';
//td.innerHTML=icon;
td=tr.insertCell(1);
td.style.paddingLeft=10;
td.innerHTML=(desc?'<strong>'+name+'</strong>':name)+
	(desc?'<br><span style="font-size:80%;opacity:0.7;">'+desc+'</span>':'');
}

function menu_addoption(icon, label, callback, holder)
{
/* make a new menu option
*/
var d=dom_create('div',holder);
d.className='menuactivechoice';
if(icon) {
	var d2=dom_create('div',d);
	d2.className='iconholder';
	d2.innerHTML=icon;
}
if(label) {
	var s=dom_addtext(d,label);
	s.style.whiteSpace='nowrap';
	s.style.marginLeft=10;
}
if(callback) {
	d.addEventListener('click', callback, false);
}
return d;
}

function menu_shutup()
{
for(var i=0; i<menu.childNodes.length; i++) {
	var n=menu.childNodes[i];
	if(n.nodeType==1) n.style.display='none';
}
}

function menu_show_beneathdom(ctxt,dom,xadjust)
{
// xadjust is for parent element scrollLeft, cannot fix this in absolutePosition
var p=absolutePosition(dom);
menu_show(ctxt,p[0]-10-document.body.scrollLeft-(xadjust?xadjust:0),p[1]-8-document.body.scrollTop+dom.offsetHeight);
}

function menu_show(ctxt,x,y)
{
/* x/y are optional,
must not contain body.scroll offset
set to -1 for not changing position
*/
pica.style.display='none';
menu.style.display='block';
if(x==undefined) {
	x=parseInt(menu.style.left)-10;
	y=parseInt(menu.style.top)-10;
}
setTimeout('placePanel(menu,'+x+'+10+document.body.scrollLeft,'+y+'+10+document.body.scrollTop);menu.style.maxHeight="'+maxHeight_menu+'";',1);
document.body.addEventListener('mousedown', menu_hide,false);
gflag.menu.bbj=gflag.browser;
gflag.menu.context=ctxt;
}
function menu_hide()
{
indicator3.style.display=
indicator7.style.display=
indicator6.style.display=
invisibleBlanket.style.display=
menu.style.display='none';
menu.style.maxHeight=1;
document.body.removeEventListener('mousedown', menu_hide,false);
gflag.menu.context=null;
}

function menu_mcm_header(event)
{
// over a mcm header term
menu_shutup();
menu_show(8, event.clientX, event.clientY);
menu.c4.style.display=menu.c25.style.display='block';
if(menu.c23)
	menu.c23.style.display='block';
gflag.menu.bbj=gflag.browser;
gflag.menu.idx=parseInt((event.clientX+document.body.scrollLeft-absolutePosition(gflag.browser.mcm.holder)[0])/tkAttrColumnWidth);
return false;
}

function fontpanel_set(tk)
{
menu.font.style.display='block';
if(tk.qtc.fontfamily) {
	var lst=menu.font.family.options;
	for(var i=0; i<lst.length; i++) {
		if(lst[i].value==tk.qtc.fontfamily) {
			menu.font.family.selectedIndex=i;
			break;
		}
	}
}
if(tk.qtc.fontbold!=undefined) {
	menu.font.bold.checked=tk.qtc.fontbold;
}
if(tk.qtc.textcolor) {
	menu.font.color.style.backgroundColor=tk.qtc.textcolor;
	menu.font.color.style.display='inline';
} else {
	menu.font.color.style.display='none';
}
}




function config_cmtk(tk)
{
menu.c14.style.display='block';
menu.c14.unify.style.display='none';
menu.c45.style.display='block';
menu.c45.combine_chg.div.style.display='none';
if(tk.cm.set.rd_r) {
	// has two strands
	menu.c45.combine_notshown.style.display='none';
	menu.c45.combine.parentNode.style.display='block';
	menu.c45.combine.checked=tk.cm.combine;
	if(tk.cm.set.chg_f && tk.cm.set.chg_r && tk.cm.combine) {
		menu.c45.combine_chg.div.style.display='block';
		menu.c45.combine_chg.checkbox.checked=tk.cm.combine_chg;
	}
} else {
	menu.c45.combine_notshown.style.display='block';
	menu.c45.combine.parentNode.style.display='none';
	menu.c45.combine.checked=false;
}
menu.c45.scale.checked=tk.cm.scale;
if(tk.cm.filter>0) {
	menu.c45.filter.checkbox.checked=true;
	menu.c45.filter.div.style.display='block';
	menu.c45.filter.input.value=tk.cm.filter;
} else {
	menu.c45.filter.checkbox.checked=false;
	menu.c45.filter.div.style.display='none';
}
var hasreverse=tk.cm.set.rd_r;
var t=menu.c45.table;
stripChild(t,0);
var tr=t.insertRow(0);
tr.insertCell(0);
var td=tr.insertCell(1);
td.align='center';
td.style.fontSize='70%';
td.innerHTML='forward / comb.';
if(hasreverse) {
	td=tr.insertCell(2);
	td.align='center';
	td.style.fontSize='70%';
	td.innerHTML='reverse';
}
tr=t.insertRow(-1);
td=tr.insertCell(0);
td.align='right';
td.innerHTML='CG';
td=tr.insertCell(-1);
var c=dom_create('canvas',td,'background-color:'+tk.cm.color.cg_f);
c.width=36; c.height=20;
c.which='cg_f';
c.addEventListener('click',cmtk_color_initiate,false);
c=dom_create('canvas',td,'background-color:'+tk.cm.bg.cg_f);
c.width=36; c.height=20;
c.which='cg_f';
c.addEventListener('click',cmtk_color_initiate,false);
c.bg=true;
if(hasreverse) {
	td=tr.insertCell(-1);
	c=dom_create('canvas',td,'background-color:'+tk.cm.color.cg_r);
	c.width=36; c.height=20;
	c.which='cg_r';
	c.addEventListener('click',cmtk_color_initiate,false);
	c=dom_create('canvas',td,'background-color:'+tk.cm.bg.cg_r);
	c.width=36; c.height=20;
	c.which='cg_r';
	c.addEventListener('click',cmtk_color_initiate,false);
	c.bg=true;
}
if(tk.cm.set.chg_f) {
	tr=t.insertRow(-1);
	td=tr.insertCell(0);
	td.align='right';
	td.innerHTML='CHG';
	td=tr.insertCell(-1);
	c=dom_create('canvas',td,'background-color:'+tk.cm.color.chg_f);
	c.width=36; c.height=20;
	c.addEventListener('click',cmtk_color_initiate,false);
	c.which='chg_f';
	c=dom_create('canvas',td,'background-color:'+tk.cm.bg.chg_f);
	c.width=36; c.height=20;
	c.which='chg_f';
	c.addEventListener('click',cmtk_color_initiate,false);
	c.bg=true;
	if(hasreverse) {
		td=tr.insertCell(-1);
		c=dom_create('canvas',td,'background-color:'+tk.cm.color.chg_r);
		c.width=36; c.height=20;
		c.which='chg_r';
		c.addEventListener('click',cmtk_color_initiate,false);
		c=dom_create('canvas',td,'background-color:'+tk.cm.bg.chg_r);
		c.width=36; c.height=20;
		c.which='chg_r';
		c.addEventListener('click',cmtk_color_initiate,false);
		c.bg=true;
	}
}
if(tk.cm.set.chh_f) {
	tr=t.insertRow(-1);
	td=tr.insertCell(0);
	td.align='right';
	td.innerHTML='CHH';
	td=tr.insertCell(-1);
	c=dom_create('canvas',td,'background-color:'+tk.cm.color.chh_f);
	c.width=36; c.height=20;
	c.which='chh_f';
	c.addEventListener('click',cmtk_color_initiate,false);
	c=dom_create('canvas',td,'background-color:'+tk.cm.bg.chh_f);
	c.width=36; c.height=20;
	c.which='chh_f';
	c.addEventListener('click',cmtk_color_initiate,false);
	c.bg=true;
	if(hasreverse) {
		td=tr.insertCell(-1);
		c=dom_create('canvas',td,'background-color:'+tk.cm.color.chh_r);
		c.width=36; c.height=20;
		c.which='chh_r';
		c.addEventListener('click',cmtk_color_initiate,false);
		c=dom_create('canvas',td,'background-color:'+tk.cm.bg.chh_r);
		c.width=36; c.height=20;
		c.which='chh_r';
		c.addEventListener('click',cmtk_color_initiate,false);
		c.bg=true;
	}
}
tr=t.insertRow(-1);
td=tr.insertCell(0);
td.innerHTML='read depth';
td=tr.insertCell(-1);
c=dom_create('canvas',td,'background-color:'+tk.cm.color.rd_f);
c.width=50; c.height=20;
c.which='rd_f';
c.addEventListener('click',cmtk_color_initiate,false);
if(hasreverse) {
	td=tr.insertCell(-1);
	c=dom_create('canvas',td,'background-color:'+tk.cm.color.rd_r);
	c.width=50; c.height=20;
	c.which='rd_r';
	c.addEventListener('click',cmtk_color_initiate,false);
}
// smoothing for rd
menu.c46.style.display='block';
if(tk.cm.set.rd_f.qtc.smooth) {
	menu.c46.checkbox.checked=true;
	menu.c46.div.style.display='block';
	menu.c46.says.innerHTML=tk.cm.set.rd_f.qtc.smooth+'-pixel window';
} else {
	menu.c46.checkbox.checked=false;
	menu.c46.div.style.display='none';
}
}

function config_numerical(tk)
{
var q=tk.qtc;
qtcpanel_setdisplay({qtc:q,
color1:'rgb('+q.pr+','+q.pg+','+q.pb+')',
color1text:'positive',
color2:'rgb('+q.nr+','+q.ng+','+q.nb+')',
color2text:'negative',
ft:tk.ft,
});
menu.c14.style.display='block';
menu.c14.unify.style.display='none';
menu.c51.sharescale.style.display=tk.group!=undefined?'block':'none';
}
function config_cat(tk)
{
cateCfg_show(tk,false);
}
function config_density(tk)
{
qtcpanel_setdisplay({
qtc:tk.qtc,
color1:'rgb('+tk.qtc.pr+','+tk.qtc.pg+','+tk.qtc.pb+')',
ft:tk.ft,
});
menu.c14.style.display='block';
menu.c14.unify.style.display='none';
menu.c59.style.display='none';
menu.c51.sharescale.style.display=tk.group!=undefined?'block':'none';
}
function config_ld(tk)
{
// not density mode
menu.c49.style.display='block';
menu.c49.color.style.backgroundColor='rgb('+tk.qtc.pr+','+tk.qtc.pg+','+tk.qtc.pb+')';
menu.c14.style.display='block';
menu.c14.unify.style.display='none';
config_hammock(tk);
menu.font.style.display=menu.bed.style.display='none';
}

function config_hammock(tk)
{
/* not density
can be nested inside other tracks that derives from hammock format
*/
fontpanel_set(tk);
if(tk.mode==M_bar) {
	menu.c14.style.display='block';
	menu.c14.unify.style.display='none';
}
if(tk.cateInfo) {
	// TODO text color is same as item color
	menu.font.color.style.display='none';
	menu.bed.style.display='none';
	cateCfg_show(tk,false,true);
} else {
	// all items have same color, separate color for item/text
	menu.font.color.style.display='inline';
	menu.bed.style.display='block';
	menu.bed.color.style.backgroundColor=tk.qtc.bedcolor;
}
if(tk.showscoreidx!=undefined) {
	menu.c48.style.display='block';
	stripChild(menu.c48,0);
	var n=Math.random().toString();
	dom_create('div',menu.c48,'opacity:0.5;margin-bottom:8px;').innerHTML='Apply score';
	if(tk.group!=undefined) {
		dom_create('div',menu.c48,'margin:5px 5px 15px 5px;padding:5px;background-color:rgba(255,204,51,.5);font-size:70%;text-align:center;',{t:'This track shares Y scale with other tracks.'});
	}
	for(var i=-1; i<tk.scorenamelst.length; i++) {
		var d0=dom_create('div',menu.c48);
		var ip=dom_create('input',d0);
		ip.type='radio';
		ip.setAttribute('name',n);
		ip.id=n+(i==-1?'n':i);
		ip.checked=tk.showscoreidx==i;
		ip.idx=i;
		ip.addEventListener('change',menu_hammock_choosescore,false);
		var lb=dom_create('label',d0);
		lb.setAttribute('for',ip.id);
		lb.innerHTML=' '+(i==-1?'do not use score':tk.scorenamelst[i]);
		if(i!=-1) {
			var d=dom_create('div',menu.c48,null,{c:'menushadowbox'});
			d.style.display=i==tk.showscoreidx?'block':'none';
			var scale=tk.scorescalelst[i];
			var tt;
			if(scale.min_fixed!=undefined) {
				tt='auto (min set at '+scale.min_fixed+')';
			} else if(scale.max_fixed!=undefined) {
				tt='auto (max set at '+scale.max_fixed+')';
			} else {
				tt='automatic scale';
			}
			dom_addselect(d,menu_hammock_changescale,
				[ {text:tt,value:scale_auto,selected:scale_auto==scale.type},
				{text:'fixed scale',value:scale_fix,selected:scale_fix==scale.type}]);
			var d2=dom_create('div',d);
			d2.style.display=scale.type==scale_fix?'block':'none';
			dom_addtext(d2,'min: ');
			dom_inputnumber(d2,{width:50,value:scale.min});
			dom_addtext(d2,' max: ');
			dom_inputnumber(d2,{width:50,value:scale.max});
			dom_addbutt(d2,'set',menu_hammock_setfixscale);
		}
	}
}
}

function menu_hammock_changescale(event)
{
// from <select>
var s=event.target;
var scale=parseInt(s.options[s.selectedIndex].value);
gflag.menu.hammock_focus={type:scale};
s.nextSibling.style.display= scale==scale_fix ? 'block' : 'none';
if(scale==scale_fix) return;
menu_update_track(29);
}

function menu_hammock_setfixscale(event)
{
// press button
var t=event.target.parentNode;
var min=parseFloat(t.childNodes[1].value);
var max=parseFloat(t.childNodes[3].value);
if(isNaN(min) || isNaN(max) || min>=max) {
	print2console('wrong min/max value',2);
	return;
}
gflag.menu.hammock_focus={min:min,max:max};
menu_update_track(28);
}

function config_bam(tk)
{
// not density
fontpanel_set(tk);
menu.bam.style.display='block';
menu.bam.f.style.backgroundColor = tk.qtc.forwardcolor;
menu.bam.r.style.backgroundColor = tk.qtc.reversecolor;
menu.bam.m.style.backgroundColor = tk.qtc.mismatchcolor;
}
function config_weaver(tk)
{
menu.c14.style.display=tk.weaver.mode==W_rough?'block':'none';
menu.c14.unify.style.display='none';
}

function config_lr(tk)
{
// not density
if(tk.mode==M_full) {
	fontpanel_set(tk);
} else if(tk.mode==M_trihm) {
	menu.c14.style.display='block';
	menu.c14.unify.style.display='none';
}
menu.lr.style.display='block';
longrange_showplotcolor('rgb('+tk.qtc.pr+','+tk.qtc.pg+','+tk.qtc.pb+')','rgb('+tk.qtc.nr+','+tk.qtc.ng+','+tk.qtc.nb+')');
menu.lr.autoscale.parentNode.style.display='block';
menu.lr.autoscale.checked=tk.qtc.thtype==scale_auto;
menu.lr.pcscore.parentNode.style.display=menu.lr.ncscore.parentNode.style.display= tk.qtc.thtype==scale_auto?'none':'inline';
menu.lr.pcscoresays.style.display=menu.lr.ncscoresays.style.display= tk.qtc.thtype==scale_auto?'inline':'none';
menu.lr.pcscore.value = tk.qtc.pcolorscore;
menu.lr.pcscoresays.innerHTML= tk.qtc.pcolorscore;
menu.lr.ncscore.value = tk.qtc.ncolorscore;
menu.lr.ncscoresays.innerHTML= tk.qtc.ncolorscore;
menu.lr.pfscore.value = tk.qtc.pfilterscore;
menu.lr.nfscore.value = tk.qtc.nfilterscore;
menu.lr.pfscore.parentNode.style.display=menu.lr.nfscore.parentNode.style.display='block';
}
function config_dispatcher(tk)
{
if(tk.mode==M_den) {
	config_density(tk);
	return;
}
switch(tk.ft) {
case FT_matplot:
	config_matplot(tk);
	break;
case FT_cm_c:
	config_cmtk(tk);
	break;
case FT_bedgraph_c:
case FT_bedgraph_n:
case FT_bigwighmtk_c:
case FT_bigwighmtk_n:
case FT_qdecor_n:
	config_numerical(tk);
	break;
case FT_cat_c:
case FT_cat_n:
case FT_catmat:
case FT_qcats:
	config_cat(tk);
	break;
case FT_bed_c:
case FT_bed_n:
case FT_anno_n:
case FT_anno_c:
	config_hammock(tk);
	break;
case FT_lr_n:
case FT_lr_c:
	config_lr(tk);
	break;
case FT_bam_c:
case FT_bam_n:
	config_bam(tk);
	break;
case FT_ld_c:
case FT_ld_n:
	config_ld(tk);
	break;
case FT_weaver_c:
	config_weaver(tk);
	break;
default:
	fatalError('single tk unknown ft');
}
}


function menuConfig()
{
menu_shutup();
var m=gflag.menu;
var bbj=m.bbj;
if(m.context==1) {
	// single track from main browser panel
	menu.c53.style.display='block';
	menu.c53.checkbox.checked=false;
	var tk=m.tklst[0];
	// bg applies to everyone
	menu.c44.style.display='block';
	if(tk.qtc.bg) {
		menu.c44.checkbox.checked=true;
		menu.c44.color.style.display='block';
		menu.c44.color.style.backgroundColor=tk.qtc.bg;
	} else {
		menu.c44.checkbox.checked=false;
		menu.c44.color.style.display='none';
	}
	config_dispatcher(tk);
} else if(m.context==2) {
	/* right click on mcm block for tracks in ghm, confusing as any tracks can be here
	or multi-selection
	*/
	menu.c53.checkbox.checked=false;
	if(m.tklst.length==1) {
		m.context=1;
		menuConfig();
	} else {
		menu.c44.style.display='block'; // tk bg
		menu.c44.checkbox.checked=false;
		menu.c44.color.style.display='none';
		var ft={};
		var den=[];
		var nft=FT_nottk, count=0; // most abundant tk
		// will only show config table of one ft, so need to prioritize
		for(var i=0; i<m.tklst.length; i++) {
			var t=m.tklst[i];
			if(t.mode==M_den) {
				den.push(i);
			} else {
				if(t.ft in ft) {
					ft[t.ft].push(i);
				} else {
					ft[t.ft]=[i];
				}
				var c=ft[t.ft].length;
				if(c>count) {
					count=c;
					nft=t.ft;
				}
			}
		}
		if(den.length>count) {
			// density mode tk wins
			config_density(m.tklst[den[0]])
		} else {
			if(nft==FT_cat_c||nft==FT_cat_n) {
				// but do not show cat config as each tk has its own cateInfo
				menu.c14.style.display=menu.c44.style.display='block';
				menu.c44.checkbox.checked=false;
				menu.c44.color.style.display='none';
			} else {
				config_dispatcher(m.tklst[ft[nft][0]]);
			}
		}
		menu.c14.unify.style.display='table-cell';
	}
} else {
	fatalError("unknown menu context id");
}
placePanel(menu, parseInt(menu.style.left), parseInt(menu.style.top));
}


function menuMcmflip()
{
var m=gflag.menu.bbj.mcm;
m.holder.attop=!m.holder.attop;
gflag.menu.bbj.mcmPlaceheader();
menu_hide();
}


Browser.prototype.removeTrack_obj=function(objlst)
{
var lst=[];
for(var i=0; i<objlst.length; i++) {
	var tk=objlst[i];
	lst.push(tk.name);
	if(tk.ft==FT_cm_c) {
		var s=tk.cm.set;
		if(s.cg_f) lst.push(s.cg_f.name);
		if(s.cg_r) lst.push(s.cg_r.name);
		if(s.chg_f) lst.push(s.chg_f.name);
		if(s.chg_r) lst.push(s.chg_r.name);
		if(s.chh_f) lst.push(s.chh_f.name);
		if(s.chh_r) lst.push(s.chh_r.name);
		if(s.rd_f) lst.push(s.rd_f.name);
		if(s.rd_r) lst.push(s.rd_r.name);
	} else if(tk.ft==FT_matplot) {
		for(var j=0; j<tk.tracks.length; j++) {
			lst.push(tk.tracks[j].name);
		}
	}
}
this.removeTrack(lst);
}


function menuRemove()
{
/* remove/hide/turnoff things depend on context
remove a thing through menu 'remove' option
*/
var _context=gflag.menu.context;
menu_hide();
var bbj=gflag.menu.bbj;
switch(_context) {
case 1:
case 2:
	/* removing tracks
	in removing from multi-select or mcm, always calling from target
	*/
	if(bbj.splinterTag) {bbj=bbj.trunk;}
	if(bbj.weaver) {
		var target=bbj.weaver.iscotton?bbj.weaver.target:bbj;
		var g2lst={}, tlst=[];
		for(var i=0; i<gflag.menu.tklst.length; i++) {
			var t=gflag.menu.tklst[i];
			if(t.cotton && t.ft!=FT_weaver_c) {
				if(t.cotton in g2lst) {
					g2lst[t.cotton].push(t);
				} else {
					g2lst[t.cotton]=[t];
				}
			} else {
				if(t.ft!=FT_weaver_c) tlst.push(t);
			}
		}
		if(tlst.length>0) target.removeTrack_obj(tlst);
		for(var n in g2lst) {
			target.weaver.q[n].removeTrack_obj(g2lst[n]);
		}
	} else {
		bbj.removeTrack_obj(gflag.menu.tklst);
	}
	glasspane.style.display='none';
	return;
case 3:
	// deleting a gene set, apps.gsm is on
	apps.gsm.bbj.genome.geneset_delete(menu.genesetIdx);
	menu_hide();
	return;
case 5:
	// remove 2nd dimension in facet
	var fa=apps.hmtk.bbj.facet;
	fa.dim2.term= fa.dim2.mdidx=null;
	fa.dim2.dom.innerHTML=literal_facet_nouse;
	menu_hide();
	apps.hmtk.bbj.generateTrackselectionLayout();
	return;
case 8:
	// delete a term from mcm
	if(gflag.menu.idx >= bbj.mcm.lst.length) return;
	bbj.mcm.lst.splice(gflag.menu.idx,1);
	bbj.initiateMdcOnshowCanvas();
	bbj.prepareMcm();
	bbj.drawMcm();
	bbj.__mcm_termchange();
	return;
case 19:
	// single wreath tk
	apps.circlet.hash[gflag.menu.viewkey].wreath.splice(gflag.menu.wreathIdx,1);
	hengeview_draw(gflag.menu.viewkey);
	return;
case 20:
	// single bev tk
	var cc=gflag.menu.bbj.genome.bev.tklst[gflag.menu.bevtkidx].chrcanvas;
	for(var chr in cc)
		cc[chr].parentNode.removeChild(cc[chr]);
	gflag.menu.bbj.genome.bev.tklst.splice(gflag.menu.bevtkidx,1);
	return;
case 21:
	// hide a region from circlet plot
	var b=menu.circlet_blob;
	var vobj=apps.circlet.hash[b.viewkey];
	vobj.regionorder.splice(vobj.regionorder.indexOf(b.ridx),1);
	hengeview_computeRegionRadian(b.viewkey);
	hengeview_ajaxupdatepanel(b.viewkey);
	menu_hide();
	return;
default:
	fatalError("menu remove: unknown menu context id");
}
}

function menu_overallconfig() {
	menu_shutup();
	document.getElementById('overallconfig').style.display='block';
}


function menu_track_browser(event)
{
/* over a track in main browser panel
or a splinter
*/
menu_shutup();

var bbj=gflag.browser;
var tk=bbj.findTrack(event.target.tkname,event.target.cotton);
if(!tk) return;

// deal with multiple select, needs trunk track
var sbj=bbj.splinterTag?bbj.trunk:bbj;
var t0=sbj.findTrack(event.target.tkname,event.target.cotton);
if(!t0) fatalError('missing trunk tk');
if(t0.menuselected) {
	// click on a multi-selected track
	gflag.menu.tklst=[];
	var qtknum=0;
	for(var i=0; i<sbj.tklst.length; i++) {
		var t=sbj.tklst[i];
		if(t.menuselected) {
			gflag.menu.tklst.push(t);
			if(isNumerical(t) && isCustom(t.ft)) {
				qtknum++;
			}
		}
	}
	menu_show(2,event.clientX,event.clientY);
	menu.c1.style.display=
	menu.c5.style.display=
	menu.c54.style.display=
	menu.c4.style.display='block';
	menu.c1.innerHTML=gflag.menu.tklst.length+' selected';
	indicator3.style.display='none';
	if(qtknum>1) menu.c64.style.display='block';
	return false;
} else {
	/* doing multiple select, now clicked on a tk that's not selected
	need to cancel the selection
	*/
	sbj.multipleselect_cancel();
}

menu_show(1, event.clientX, event.clientY);
if(tk.cotton && tk.ft!=FT_weaver_c) {
	// a cottontk, should switch to cottonbbj
	if(!bbj.weaver.iscotton) {
		gflag.menu.bbj=bbj.weaver.q[tk.cotton];
	}
}

gflag.menu.tklst=[tk];
bbj.highlighttrack([tk]);

menu.c5.style.display= // conf
menu.c4.style.display= // x
menu.c16.style.display='block'; // info

if(isCustom(tk.ft)) {
	if(menu.c19) menu.c19.style.display='block';
	if(!tk.public) {
		if(menu.c58) menu.c58.style.display='block';
	}
}

menu.c22.packbutt.style.display='none';
switch(tk.ft) {
case FT_qdecor_n:
	if(menu.c20) menu.c20.style.display= 'block';
	break;
case FT_bedgraph_c:
case FT_bedgraph_n:
	if(menu.c20) menu.c20.style.display= 'block'; // bev
	break;
case FT_bigwighmtk_c:
case FT_bigwighmtk_n:
	if(menu.c20) menu.c20.style.display= 'block';
	break;
case FT_bed_n:
case FT_bed_c:
case FT_anno_n:
case FT_anno_c:
	/*
	if(tk.dbsearch && menu.c47) {
		// search
		menu.c47.style.display='block';
		stripChild(menu.c47.table,0);
	}
	*/
	menu.c16.style.display='block'; // info
	menu.c22.style.display='block';
	if(gflag.allow_packhide_tkdata && tk.mode==M_full) {
		// pack mode only available for bed and hammock
		menu.c22.packbutt.style.display='block';
		// alert: must make copy of tk here...
		var tk2=tk;
		menu.c22.packbutt.onclick=function(){bbj.track2packmode(tk2);menu_hide();};
	}
	menu_showmodebutt(tk);
	if(!tk.issnp) {
		if(menu.c20) menu.c20.style.display= 'block';
		// do not allow this on snp tk
		if(bbj.juxtaposition.type==bbj.genome.defaultStuff.runmode) {
			menu.c12.style.display='block';
			menu.c2.style.display='none';
		} else {
			menu.c2.style.display='block';
			menu.c12.style.display='none';
		}
	}
	break;
//case FT_sam_n: case FT_sam_c:
case FT_bam_n:
case FT_bam_c:
	menu.c22.style.display='block';
	menu_showmodebutt(tk);
	if(bbj.juxtaposition.type==bbj.genome.defaultStuff.runmode) {
		menu.c2.style.display='none';
	} else {
		menu.c2.style.display='block';
	}
	break;
case FT_lr_n:
case FT_lr_c:
	if(menu.c3) {
		menu.c3.style.display=tk.mode==M_den?'none':'block';
	}
	menu_showmodebutt(tk);
	if(bbj.juxtaposition.type==bbj.genome.defaultStuff.runmode) {
		menu.c2.style.display='none';
	} else {
		menu.c2.style.display='block';
	}
	break;
case FT_cat_c:
case FT_cat_n:
	if(menu.c20) menu.c20.style.display= 'block'; // bev
	break;
case FT_matplot:
	menu.c65.style.display='block';
	break;
case FT_cm_c:
case FT_ld_c:
case FT_ld_n:
	break;
case FT_weaver_c:
	menu.c4.style.display='none';
	if(tk.reciprocal) {
		menu.c62.style.display= 'block';
		//menu.c63.style.display=
		menu.c62.childNodes[1].innerHTML='Use <strong><span style="color:'+tk.qtc.bedcolor+'">'+tk.cotton+'</span></strong> as reference';
		//menu.c63.childNodes[1].innerHTML='Find <strong><span style="color:'+tk.qtc.bedcolor+'">'+tk.cotton+'</span></strong> regions';
	}
	break;
case FT_catmat: break;
case FT_qcats: break;
default:
	print2console('invoking menu on tk of unknown ft',2);
}

if(tk.ft in FT2noteurl) {
	menu.c61.style.display='block';
	menu.c61.firstChild.innerHTML='about '+FT2verbal[tk.ft]+' track';
	var ft=tk.ft;
	menu.c61.firstChild.onclick=function(){window.open(FT2noteurl[ft])};
}

// any associated regions?
var tk=bbj.genome.hmtk[event.target.tkname];
if(tk!=undefined && tk.regions!=undefined) {
	var opt=menu.tk2region_showlst;
	opt.style.display='block';
	opt.childNodes[1].innerHTML=tk.regions[0];
}
return false;
}

function menu_showmodebutt(tk)
{
menu.c22.style.display='block';
if(tk.ft==FT_lr_c||tk.ft==FT_lr_n) {
	menu.c10.style.display=tk.mode==M_trihm?'none':'table-cell';
	menu.c11.style.display=tk.mode==M_arc?'none':'table-cell';
} else {
	menu.c10.style.display= menu.c11.style.display='none';
}
menu.c6.style.display=tk.mode==M_thin?'none':'table-cell';
menu.c7.style.display=tk.mode==M_full?'none':'table-cell';
menu.c8.style.display=tk.mode==M_den?'none':'table-cell';
menu.c60.style.display='none';
if((tk.ft==FT_anno_c||tk.ft==FT_anno_n) && tk.scorenamelst && tk.mode!=M_bar) {
	menu.c60.style.display='table-cell';
}
}

function menuDecorChangemode(event)
{
// pushing mode butt
var bbj=gflag.menu.bbj;
var tk=gflag.menu.tklst[0];
if(bbj.splinterTag) {
	bbj=bbj.trunk;
	tk=bbj.findTrack(tk.name);
}
// alert
var tom=event.target.mode;
if((tom==M_thin||tom==M_full||tom==M_bar) && tk.mode!=M_den) {
	var itemcount=0;
	for(var i=0; i<tk.data.length; i++) {
		itemcount+=tk.data[i].length;
	}
	itemcount+=tk.skipped?tk.skipped:0;
	if(itemcount>trackitemnumAlert) {
		menu_shutup();
		var d=menu.changemodealert;
		d.style.display='block';
		d.count.innerHTML=itemcount;
		d.mode.innerHTML=mode2str[tom];
		d.tk=tk;
		d.tom=tom;
		return;
	}
}
bbj.tkchangemode(tk,tom);
menu_hide();
}

Browser.prototype.tkchangemode=function(tk,mode)
{
tk.mode=mode;
this.ajax_addtracks([tk]);
for(var tag in this.splinters) {
	var tk2=this.splinters[tag].findTrack(tk.name);
	tk2.mode=mode;
	this.splinters[tag].ajax_addtracks([tk2]);
}
}

function risky_changemode()
{
var bbj=gflag.menu.bbj;
if(bbj.trunk) bbj=bbj.trunk;
bbj.tkchangemode(menu.changemodealert.tk,menu.changemodealert.tom);
menu_hide();
}

function menu_blank()
{
menu_shutup();
stripChild(menu.c32,0);
menu.c32.style.display='block';
}

/*** __menu__ ends ***/



/*** __matplot__ **/

function matplot_menucreate()
{
// create obj
var nlst=[], olst=[];
for(var i=0; i<gflag.menu.tklst.length; i++) {
	var t=gflag.menu.tklst[i];
	if(isNumerical(t)) {
		nlst.push(t.name);
		olst.push(t);
	}
}
if(nlst.length==0) {
	print2console('Cannot make matplot: no numerical tracks',2);
	menu_hide();
	return;
}
var bbj=gflag.menu.bbj;
if(bbj.trunk) {
	bbj=bbj.trunk;
}
var mtk0={name:bbj.genome.newcustomtrackname(),
	label:'matplot wrap',
	ft:FT_matplot,
	mode:M_show,
	tracks:nlst, // must be names
	};
bbj.genome.registerCustomtrack(mtk0);
var mtk=bbj.makeTrackDisplayobj(mtk0.name,FT_matplot);
for(var i=0; i<olst.length; i++) {
	var t=olst[i];
	t.mastertk=mtk;
	// must also alter registry obj
	var o=bbj.genome.getTkregistryobj(t.name,t.ft);
	if(!o) {
		print2console('missing registry obj for '+t.label,2);
	} else {
		o.mastertk=mtk.name;
	}
	bbj.removeTrackCanvas(t);
}
bbj.tklst.push(mtk);
bbj.trackdom2holder();
bbj.drawTrack_browser(mtk);
for(var k in bbj.splinters) {
	var b2=bbj.splinters[k];
	var mtk2=b2.makeTrackDisplayobj(mtk0.name,FT_matplot);
	for(var i=0; i<nlst.length; i++) {
		var t=b2.findTrack(nlst[i]);
		if(t) {
			t.mastertk=mtk2;
			b2.removeTrackCanvas(t);
		}
	}
	b2.tklst.push(mtk2);
	b2.trackdom2holder();
	b2.drawTrack_browser(mtk2);
}
bbj.prepareMcm();
bbj.drawMcm_onetrack(mtk);
menu_hide();
bbj.multipleselect_cancel();
}
function matplot_menucancel()
{
var mlst=[];
for(var i=0; i<gflag.menu.tklst.length; i++) {
	var t=gflag.menu.tklst[i];
	if(t.ft==FT_matplot) {
		mlst.push(t);
	}
}
if(mlst.length==0) {
	print2console('No matplot',2);
	menu_hide();
	return;
}
var bbj=gflag.menu.bbj;
if(bbj.trunk) {
	bbj=bbj.trunk;
	// note! invoking menu on splinter, so gflag.menu.tklst are all splinter display obj, must convert to trunk obj
	var lst=[];
	for(var i=0; i<mlst.length; i++) {
		var t=bbj.findTrack(mlst[i].name);
		if(t) {
			lst.push(t);
		} else {
			print2console('trunk matplot missing '+mlst[i].name,2);
		}
	}
	mlst=lst;
}
for(var i=0; i<mlst.length; i++) {
	var mtk=mlst[i];
	bbj.delete_custtk([mtk.name]);
	//delete bbj.genome.hmtk[mtk.name];
	for(var j=0; j<mtk.tracks.length; j++) {
		var t=mtk.tracks[j];
		delete t.mastertk;
		bbj.drawTrack_browser(t);
		bbj.drawMcm_onetrack(t);
		if(isCustom(t)) {
			// member may be native
			delete bbj.genome.hmtk[t.name].mastertk;
		}
	}
	bbj.removeTrack([mtk.name]);
	for(var k in bbj.splinters) {
		var b2=bbj.splinters[k];
		for(var j=0; j<mtk.tracks.length; j++) {
			var t=b2.findTrack(mtk.tracks[j].name);
			if(t) {
				delete t.mastertk;
				b2.drawTrack_browser(t);
			} else {
				print2console('matplot member '+t.name+' missing in splinter',2);
			}
		}
		//b2.removeTrack([mtk.name]);
	}
}
bbj.trackdom2holder();
for(var k in bbj.splinters) {
	bbj.splinters[k].trackdom2holder();
}
menu_hide();
}

function config_matplot(tk)
{
qtcpanel_setdisplay({
qtc:tk.qtc,
ft:tk.ft,
no_log:true,
no_smooth:true,
});
menu.c51.sharescale.style.display='none';
stripChild(menu.c13,0);
var t=dom_create('table',menu.c13,'color:inherit;');
t.cellSpacing=5;
for(var i=0; i<tk.tracks.length; i++) {
	var t2=tk.tracks[i];
	var tr=t.insertRow(-1);
	var td=tr.insertCell(0);
	td.className='squarecell';
	var q=t2.qtc;
	td.style.backgroundColor='rgb('+q.pr+','+q.pg+','+q.pb+')';
	td.onclick=matplot_linecolor_initiate;
	td.tkidx=i;
	tr.insertCell(1).innerHTML=t2.label;
}
menu.c13.style.display='block';
menu.c14.style.display='block';
menu.c14.unify.style.display='none';
}

function matplot_linecolor_initiate(event)
{
paletteshow(event.clientX, event.clientY, 14);
palettegrove_paint(event.target.style.backgroundColor);
gflag.menu.matplottkcell=event.target;
}

function matplot_linecolor()
{
gflag.menu.matplottkcell.style.backgroundColor=palette.output;
var mat=gflag.menu.tklst[0];
var target=mat.tracks[gflag.menu.matplottkcell.tkidx];
var x=colorstr2int(palette.output);
target.qtc.pr=x[0];
target.qtc.pg=x[1];
target.qtc.pb=x[2];
gflag.menu.bbj.matplot_drawtk(mat,target);
gflag.menu.bbj.drawTrack_header(mat);
}


Browser.prototype.matplot_drawtk=function(mtk,tk,tosvg)
{
/* draw a tk as a line
	* tk should already be in mtk.tklst
	* mtk scale should be defined and should not change!
args:
mtk: matplot tk
tk: the tk of the path
*/
var q=tk.qtc;
var d=this.tkplot_line({
	ctx:mtk.canvas.getContext('2d'),
	tk:tk,
	max:mtk.maxv,
	min:mtk.minv,
	color:'rgb('+q.pr+','+q.pg+','+q.pb+')',
	linewidth:2,
	x:0, 
	y:densitydecorpaddingtop, 
	w:(this.entire.atbplevel ? this.entire.bpwidth : 1),
	h:mtk.qtc.height,
	pointup:true,tosvg:tosvg});
if(tosvg) return d;
}


/*** __matplot__ ends **/



/*** __note__ ***/

function menu_coordnote(event)
{
// right click on main panel ideogram canvas, show option related to coordnote
if(!menu.stickynote) return;
menu_shutup();
var n=menu.stickynote;
n.style.display='block';
if(event.target.tagName=='IMG') {
	// clicked on note
	n.firstChild.style.display=
	n.childNodes[1].style.display='none';
	n.childNodes[2].style.display='block';
	menu_show(0,event.clientX,event.clientY);
	var pos=absolutePosition(event.target);
	placeIndicator3(pos[0],pos[1],event.target.clientWidth,event.target.clientHeight);
	gflag.note={
		bbj:gflag.browser,
		chrom:event.target.chrom,
		coord:event.target.coord,
		update:true,
		};
} else {
	n.firstChild.style.display='block';
	n.childNodes[1].style.display=
	n.childNodes[2].style.display= 'none';
	menu_show(0,event.clientX,event.clientY);
	var pos=absolutePosition(event.target);
	var x=event.clientX+document.body.scrollLeft;
	placeIndicator3(x,pos[1],1,event.target.height);
	var bbj=gflag.browser;
	pos=absolutePosition(bbj.hmdiv.parentNode);
	var rr=bbj.sx2rcoord(x-pos[0]-bbj.move.styleLeft);
	if(!rr) return false;
	gflag.note={
		bbj:(bbj.splinterTag!=null?bbj.trunk:bbj),
		chrom:bbj.regionLst[rr.rid][0],
		coord:rr.coord,
		update:false,
		};
}
return false;
}

function coordnote_showinputpanel(event)
{
// show input panel
// for new entry or updating
var n=menu.stickynote;
n.firstChild.style.display=
n.childNodes[2].style.display='none';
n.childNodes[1].style.display='block';
n.says.innerHTML=gflag.note.chrom+', '+gflag.note.coord;
var text='';
if(event.target.doedit) {
	var lst=gflag.note.bbj.notes;
	for(var i=0; i<lst.length; i++) {
		if(lst[i].chrom==gflag.note.chrom && lst[i].coord==gflag.note.coord) {
			text=lst[i].text;
			break;
		}
	}
}
n.textarea.value=text;
}

function coordnote_submit()
{
// no ajax
var text=menu.stickynote.textarea.value;
if(text.length==0) {
	print2console('Cannot make note: no text written',2);
	return;
}
var bbj=gflag.note.bbj;
if(gflag.note.update) {
	var lst=bbj.notes;
	for(var i=0; i<lst.length; i++) {
		if(lst[i].chrom==gflag.note.chrom && lst[i].coord==gflag.note.coord) {
			lst[i].text=text;
			break;
		}
	}
} else {
	bbj.notes.push({
		chrom:gflag.note.chrom,
		coord:gflag.note.coord,
		text:text,
	});
}
bbj.drawIdeogram_browser(false);
for(var s in bbj.splinters)
	bbj.splinters[s].drawIdeogram_browser(false);
menu_hide();
}

Browser.prototype.draw_coordnote=function()
{
/* draw/make coordnote after ideogram is drawn
called by drawIdeogram_browser()
*/
var holder=this.ideogram.canvas.parentNode;
stripChild(holder,1);
// first of all, remove all notes there
if(this.notes.length==0) return;

// insert notes
var xoffset=0;
for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	for(var j=0; j<this.notes.length; j++) {
		var n=this.notes[j];
		if(n.chrom!=r[0] || r[3]>n.coord || r[4]<n.coord) continue;
		// insert this note
		var img=document.createElement('img');
		img.src='images/stickyNote.png';
		img.className='coordnote';
		img.oncontextmenu=menu_coordnote;
		img.addEventListener('mouseover',coordnote_mover,false);
		img.addEventListener('mouseout',pica_hide,false);
		img.chrom=n.chrom;
		img.coord=n.coord;
		holder.appendChild(img);
		img.style.left=xoffset+
			(this.entire.atbplevel?((n.coord-r[3])*this.entire.bpwidth):((n.coord-r[3])/r[7]));
	}
	xoffset+=r[5]+regionSpacing.width;
}
}

function coordnote_mover(event) {
// pica shows note text
var lst=gflag.browser.notes;
var pos=absolutePosition(event.target);
for(var i=0; i<lst.length; i++) {
	var n=lst[i];
	if(n.chrom==event.target.chrom && n.coord==event.target.coord) {
		picasays.innerHTML='At '+n.chrom+', '+n.coord+':<pre>'+n.text+'</pre>';
		pica_go(pos[0]+20-document.body.scrollLeft,pos[1]+20-document.body.scrollTop);
		return;
	}
}
}

function coordnote_delete() {
	var bbj=gflag.note.bbj;
	var lst=bbj.notes;
	for(var i=0; i<lst.length; i++) {
		if(lst[i].chrom==gflag.note.chrom && lst[i].coord==gflag.note.coord) {
			//bbj.ideogram.canvas.parentNode.removeChild(lst[i].img);
			lst.splice(i,1);
			break;
		}
	}
	bbj.drawIdeogram_browser(false);
	for(var s in bbj.splinters)
		bbj.splinters[s].drawIdeogram_browser(false);
	menu_hide();
}

/*** __note__ ends ***/




/*** __lr__ longrange specific ***/

function longrange_showplotcolor(pcolor,ncolor)
{
// plot the two color stripe in the menu config panel
if(pcolor) {
	var c=menu.lr.pcolor;
	c.style.backgroundColor=pcolor;
	var ctx=c.getContext('2d');
	var lingrad = ctx.createLinearGradient(0,0,c.width,0);
	lingrad.addColorStop(0,'white');
	lingrad.addColorStop(1, pcolor);
	ctx.fillStyle = lingrad;
	ctx.fillRect(0,0,c.width,c.height);
}
if(ncolor) {
	var c=menu.lr.ncolor;
	c.style.backgroundColor=ncolor;
	var ctx=c.getContext('2d');
	var lingrad = ctx.createLinearGradient(0,0,c.width,0);
	lingrad.addColorStop(0,'white');
	lingrad.addColorStop(1, ncolor);
	ctx.fillStyle = lingrad;
	ctx.fillRect(0,0,c.width,c.height);
}
}

function menu_showtk2region()
{
/* called through menu option
???
*/
var tk=gflag.menu.bbj.genome.hmtk[gflag.menu.tklst[0].name];
if(!tk || !tk.regions) {
	menu_hide();
	print2console('This track does not have associated regions',2);
	return;
}
var lst=tk.regions[1];
var lst2=[];
for(var i=0; i<lst.length; i++) {
	//lst2.push('<a class=a2 href="javascript:void(0)" onclick="menu.relocate.coord.value=\''+lst[i]+'\';gflag.jump.type=1;menuJump();menu_hide();">'+lst[i]+'</a>');
}
menu_shutup();
var h=menu.tk2region_showlst.nextSibling;
h.style.display='block';
h.innerHTML=lst2.join('<br>');
}

/*** __lr__ ends ***/






Browser.prototype.is_gsv=function()
{
var t=this.juxtaposition.type;
return t==RM_gsv_c || t==RM_gsv_kegg || t==RM_protein;
}




/* __cate__ categorical track */

function cateInfo_copy(fromobj, toobj)
{
/* args are cateInfo hash */
for(var k in fromobj) {
	toobj[k]=[fromobj[k][0], fromobj[k][1]];
}
toobj[-1]=['no information', 'transparent'];
}
function cateTk_wreath_config(tkn) {
/* wrapper, configuring a wreath track, viewidx is given by chiapet.viewidx */
	gflag.cateTk.which=4;
	gflag.cateTk.chiapetvidx=chiapet.viewidx;
	var lst=chiapet.datalst[chiapet.viewidx].wreath;
	for(var i=0; i<lst.length; i++) {
		if(lst[i].name==tkn) {
			gflag.cateTk.wreathidx=i;
			cateCfg_show({ft:lst[i].filetype, name:tkn, label:lst[i].label, cateInfo:lst[i].cateInfo},false);
			return;
		}
	}
	fatalError('cateTk_wreath_config: track not found '+tkn);
}
function cateCfg_show(tkobj,showcateid,disablecc)
{
if(!tkobj.cateInfo) {
	print2console('not categorical??',2);
	return;
}
menu.catetkobj=tkobj;
var lst=['<table cellspacing=3 style="color:inherit;">'];
for(var i in tkobj.cateInfo) {
	if(i==-1) continue;
	var t=tkobj.cateInfo[i];
	lst.push('<tr><td>'+(showcateid?i:'')+'</td><td class=squarecell itemidx='+i+
	(disablecc?'':' onclick="cateTkitemcolor_initiate(event)"')+
	' style="background-color:'+t[1]+';"></td><td>'+t[0]+'</td></tr>');
}
// restore button is only shown for native hmtk
if(tkobj.ft==FT_cat_n) {
	lst.push('<tr><td colspan=3 style="padding-left:20px"><button type=button onclick=menu_update_track(35)>Restore color settings</button></td></tr>');
}
if(!showcateid) {
	lst.push('<tr><td colspan=3 style="padding-left:20px;"><button type=button onclick=cateCfg_showcateid(event)>Show category id</button></td></tr>');
}
lst.push('</table>');
menu.c13.innerHTML=lst.join('');
menu.c13.style.display=
menu.c14.style.display='block';
menu.c14.unify.style.display='none';
}

function cateCfg_showcateid(event)
{
event.target.style.display='none';
cateCfg_show(menu.catetkobj,true);
}


function cateTkitemcolor_initiate(event)
{
/* invoking color palette for categorical track from the configuration menu
track is identified by gflag.menu
*/
paletteshow(event.clientX, event.clientY, 42);
palettegrove_paint(event.target.style.backgroundColor);
gflag.menu.catetk.itemidx=parseInt(event.target.getAttribute('itemidx'));
gflag.menu.catetk.item=event.target;
}
function cateTkitemcolor()
{
/* change item color */
var sto=gflag.menu.catetk;
sto.item.style.backgroundColor=palette.output;
menu_update_track(34);
}

function custcate_idnum_change_input()
{
var _g=apps.custtk.bbj.genome;
var value=_g.custtk.ui_cat.category_idnum.value;
if(value.length==0) return;
var num=parseInt(value);
if(isNaN(num)) {
	print2console('Invalid number of categories',2);
	return;
}
if(num<=1) {
	print2console('There must be more than 1 categories',2);
	return;
}
if(num>40) {
	print2console('Are you sure you want '+num+' categories?',2);
	return;
}
_g.custcate_idnum_change(num);
}

Genome.prototype.custcate_idnum_change=function(num)
{
var table=this.custtk.ui_cat.category_table;
stripChild(table,0);
this.custtk.ui_cat.lst=[];
for(var i=0; i<num; i++) {
	var tr=table.insertRow(-1);
	tr.insertCell(0).innerHTML=i+1;
	var td=tr.insertCell(1);
	var s=dom_create('span',td,'padding:0px 8px;background-color:'+colorCentral.longlst[i]);
	s.className='squarecell';
	s.innerHTML='&nbsp;';
	s.addEventListener('click',custcate_color_initiate,false);
	var ip=dom_create('input',td);
	ip.type='text';
	ip.size=10;
	this.custtk.ui_cat.lst.push([ip,s]);
}
}

function custcate_color_initiate(event)
{
/* invoking color palette for cust cate in submit ui
*/
paletteshow(event.clientX, event.clientY, 39);
palettegrove_paint(event.target.style.backgroundColor);
gflag.menu.catetk.item=event.target;
}
function custcate_submitui_setcolor()
{
/* change item color */
gflag.menu.catetk.item.style.backgroundColor=palette.output;
}


/* __cate__ ends */


/*** __custtk__ custom track submission and management ***/
function custtk_shortcut(ft)
{
menu_hide();
toggle7_1();
custtkpanel_show(ft);
}
function facet2custtklst(event)
{
gflag.menu.bbj=apps.hmtk.bbj;
menu_shutup();
menu_show_beneathdom(0,event.target);
menu_custtk_showall();
}
function menu_custtk_showall()
{
// called by "List of all" option in custtk menu
var bbj=gflag.menu.bbj;
if(bbj.genome.custtk.names.length==0) {
	menu_hide();
	return;
}
var lst=[];
for(var i=0; i<bbj.genome.custtk.names.length; i++) {
	var n=bbj.genome.custtk.names[i];
	var tk=bbj.genome.hmtk[n];
	if(!tk) {
		print2console('this guy has gone missing!? '+n,2);
		continue;
	}
	if(tk.mastertk) {
		// this is a member tk
		continue;
	}
	if(tk.public) {
		// from public hub
		continue;
	}
	lst.push(n);
}
bbj.showhmtkchoice({lst:lst,delete:true,context:22});
}

function custtk_useexample(ft)
{
var info=apps.custtk.bbj.genome.defaultStuff.custtk;
if(!(ft in info)) {
	print2console('Not available for this track type.',2);
	return;
}
var c=apps.custtk.bbj.genome.custtk;
switch(ft) {
case FT_bed_c:
	c.ui_bed.input_url.value=info[ft].url;
	c.ui_bed.input_name.value=info[ft].name;
	return;
case FT_bedgraph_c:
	c.ui_bedgraph.input_url.value=info[ft].url;
	c.ui_bedgraph.input_name.value=info[ft].name;
	return;
case FT_bam_c:
	c.ui_bam.input_url.value=info[ft].url;
	c.ui_bam.input_name.value=info[ft].name;
	return;
case FT_lr_c:
	c.ui_lr.input_url.value=info[ft].url;
	c.ui_lr.input_name.value=info[ft].name;
	return;
case FT_bigwighmtk_c:
	c.ui_bigwig.input_url.value=info[ft].url;
	c.ui_bigwig.input_name.value=info[ft].name;
	return;
case FT_cat_c:
	c.ui_cat.input_url.value=info[ft].url;
	c.ui_cat.input_name.value=info[ft].name;
	return;
case FT_huburl:
	c.ui_hub.input_url.value=info[ft].url;
	return;
case FT_anno_c:
	c.ui_hammock.input_url.value=info[ft].url;
	c.ui_hammock.input_name.value=info[ft].name;
	if(info[ft].json) {
		c.ui_hammock.input_json.value=JSON.stringify(info[ft].json);
	}
	return;
case FT_weaver_c:
	c.ui_weaver.input_url.value=info[ft].url;
	c.ui_weaver.input_name.value=info[ft].name;
	return;
default: fatalError('unknown ft');
}
}
function custtkpanel_show(ft)
{
// clicking big butt to show submit ui
var c=apps.custtk.bbj.genome.custtk;
apps.custtk.main.__hbutt2.style.display='block';
c.ui_bed.style.display=ft==FT_bed_c?'block':'none';
c.ui_bedgraph.style.display=ft==FT_bedgraph_c?'block':'none';
c.ui_cat.style.display=ft==FT_cat_c?'block':'none';
c.ui_bam.style.display=ft==FT_bam_c?'block':'none';
c.ui_lr.style.display=ft==FT_lr_c?'block':'none';
c.ui_bigwig.style.display=ft==FT_bigwighmtk_c?'block':'none';
c.ui_hammock.style.display=ft==FT_anno_c?'block':'none';
c.ui_weaver.style.display=ft==FT_weaver_c?'block':'none';
c.ui_hub.style.display=ft==FT_huburl?'block':'none';
if(c.ui_submit.style.display=='none') {
	flip_panel(c.buttdiv,c.ui_submit,true);
}
apps.custtk.shortcut[ft].style.display='inline-block';
}
function custtkpanel_back2control()
{
apps.custtk.main.__hbutt2.style.display='none';
var c=apps.custtk.bbj.genome.custtk;
if(c.ui_submit.style.display!='none') {
	flip_panel(c.buttdiv,c.ui_submit,false);
}
}

Genome.prototype.registerCustomtrack=function(hash)
{
/* register one custom track, has nothing to do with bbj
hash/oo: raw materials for making registry object
*/
if(!isCustom(hash.ft)) fatalError("registerCustomtrack: not custom track filetype");
if(!hash.name) fatalError('cannot registery nameless custom track');
if(hash.url) {
	// XXXb
	if(this.tkurlInUse(hash.url)) return;
}

var oo=this.pending_custtkhash[hash.name];
delete this.pending_custtkhash[hash.name];
if(!oo) {
	oo={};
}
if(hash.name in this.hmtk) {
	/* is the case of adding back a hidden track
	in golden, the track style might have changed
	must update .qtc in registry obj
	*/
	var _o=this.hmtk[hash.name];
	if(oo.qtc) {
		if(!_o.qtc) {
			_o.qtc={};
		}
		qtc_paramCopy(oo.qtc,_o.qtc);
	}
	return;
}

/* the registry object */
var o={name:hash.name,
	label:hash.label,
	url:hash.url,
	ft:hash.ft,
	mode:hash.mode,
	md:[],
	qtc:{},
};
if(o.ft==FT_cm_c || o.ft==FT_matplot) {
	delete o.url;
}

// parse and append attributes
var x=hash.public?true:(oo.public?true:false);
if(x) {
	o.public=true;
}

x=hash.horizontallines?hash.horizontallines:(oo.horizontallines?oo.horizontallines:null);
if(x) {
	o.horizontallines=x;
}

x=hash.cotton?hash.cotton:(oo.cotton?oo.cotton:null);
if(x) {
	o.cotton=x;
}

if(o.ft==FT_catmat) {
	o.rowcount=hash.rowcount?hash.rowcount:oo.rowcount;
	if(!o.rowcount) {
		print2console('rowcount missing in registering catmat',2);
	}
	o.rowheight=hash.rowheight?hash.rowheight:oo.rowheight;
	if(!o.rowheight) {
		print2console('rowheight missing in registering catmat',2);
	}
}

if(o.ft==FT_weaver_c) {
	x=hash.reciprocal?hash.reciprocal:(oo.reciprocal?oo.reciprocal:null);
	if(x) {
		o.reciprocal=x;
	}
}

x=hash.weaver?hash.weaver:(oo.weaver?oo.weaver:null);
if(x) {
	o.weaver={};
	for(var n in x) {
		o.weaver[n]=x[n];
	}
}

x=hash.defaultmode!=undefined?hash.defaultmode:((oo.defaultmode!=undefined)?oo.defaultmode:null);
if(x!=null) {
	o.defaultmode=x;
}

x=hash.showscoreidx!=undefined?hash.showscoreidx:((oo.showscoreidx!=undefined)?oo.showscoreidx:null);
if(x!=null) {
	o.showscoreidx=x;
}

x=hash.scorenamelst?hash.scorenamelst:(oo.scorenamelst?oo.scorenamelst:null);
if(x) {
	o.scorenamelst=x;
}

x=hash.scorescalelst?hash.scorescalelst:(oo.scorescalelst?oo.scorescalelst:null);
if(x) {
	o.scorescalelst=x;
}

x=hash.details?hash.details:(oo.details?oo.details:null);
if(x) {
	o.details=x;
}

x=hash.detail_url?hash.detail_url:(oo.detail_url?oo.detail_url:null);
if(x) {
	o.detail_url=x;
}

// track name
x=hash.mastertk?hash.mastertk:(oo.mastertk?oo.mastertk:null);
if(x) {
	o.mastertk=x;
}

var cm=hash.cm?hash.cm:(oo.cm?oo.cm:null);
if(cm) {
	o.cm=cm;
}
if(o.ft==FT_matplot) {
	o.tracks=[];
	x=hash.tracks?hash.tracks:(oo.tracks?oo.tracks:null);
	if(x) {
		o.tracks=x;
	}
}
var md=hash.md?hash.md:(oo.md?oo.md:null);
if(md) {
	for(var i=0; i<md.length; i++) {
		if(!md[i]) continue;
		var s={};
		for(var x in md[i]) {
			s[x]=1;
		}
		o.md[i]=s;
	}
}
var geo=hash.geo?hash.geo:(oo.geo?oo.geo:null);
if(geo) {
	o.geolst=geo.split(',');
}
var x=hash.geolst?hash.geolst:(oo.geolst?oo.geolst:null);
if(x) {
	o.geolst=[];
	for(var i=0; i<x.length; i++) {
		o.geolst.push(x[i]);
	}
}
var normalize=hash.normalize?hash.normalize:(oo.normalize?oo.normalize:null);
if(normalize) {
	o.normalize={method:normalize};
	var rn=hash.total_mapped_reads?hash.total_mapped_reads:(oo.total_mapped_reads?oo.total_mapped_reads:null);
	o.normalize.total_mapped_reads=rn;
}
var group=hash.group!=undefined?hash.group:(oo.group!=undefined?oo.group:null);
if(group) {
	o.group=group;
}
var ci=hash.cateInfo?hash.cateInfo:(oo.cateInfo?oo.cateInfo:null);
if(ci) {
	o.cateInfo={};
	cateInfo_copy(ci,o.cateInfo);
}

/* qtc */
var tq=hash.qtc?hash.qtc:oo.qtc;
if(tq) {
	if(!o.qtc) {
		o.qtc={};
	}
	qtc_paramCopy(tq,o.qtc);
}
this.custtk.names.push(o.name);
this.hmtk[o.name]=o;
}


Genome.prototype.newcustomtrackname=function()
{
var n = Math.random().toString().split('.')[1];
while((n in this.hmtk) || (n in this.decorInfo))
	n = Math.random().toString().split('.')[1];
return n;
}

Genome.prototype.tkurlInUse=function(url)
{
for(var t in this.hmtk) {
	var tk=this.hmtk[t];
	if(isCustom(tk.ft) && tk.url==url) return true;
}
return false;
}




function submitCustomtrack(event)
{
/* called only by pushing button, works for all types
real tracks, not datahub
20130326 big old bug of not adding track for splinters
*/
var ft=event.target.ft;
var bbj=apps.custtk.bbj;
if(ft==FT_huburl) {
	bbj.loaddatahub_pushbutt();
	return;
}
if(!isCustom(ft)) fatalError('wrong ft');
var c;
var _tmp={
	ft:ft,
	name:bbj.genome.newcustomtrackname(),
	mode:M_show,
};

switch(ft){
case FT_bedgraph_c:
	c=bbj.genome.custtk.ui_bedgraph;
	_tmp.url=c.input_url.value.trim();
	_tmp.label=c.input_name.value;
	_tmp.qtc={height:40};
	break;
case FT_bigwighmtk_c:
	c=bbj.genome.custtk.ui_bigwig;
	_tmp.url=c.input_url.value.trim();
	_tmp.label=c.input_name.value;
	_tmp.qtc={height:40};
	break;
case FT_cat_c:
	c=bbj.genome.custtk.ui_cat;
	_tmp.url=c.input_url.value.trim();
	_tmp.label=c.input_name.value;
	if(c.lst.length<=1) {
		print2console('Wrong cateinfo',2);
		return;
	}
	_tmp.cateInfo={};
	for(var i=0; i<c.lst.length; i++) {
		var textinput=c.lst[i][0].value;
		if(textinput.length>0) {
			_tmp.cateInfo[i+1]=[textinput,c.lst[i][1].style.backgroundColor];
		} else {
			print2console('No name provided for category '+(i+1),2);
			return;
		}
	}
	break;
case FT_bed_c:
	c=bbj.genome.custtk.ui_bed;
	_tmp.url=c.input_url.value.trim();
	_tmp.label=c.input_name.value;
	_tmp.mode=parseInt(c.mode.options[c.mode.selectedIndex].value);
	break;
case FT_lr_c:
	c=bbj.genome.custtk.ui_lr;
	_tmp.url=c.input_url.value.trim();
	_tmp.label=c.input_name.value;
	_tmp.mode=parseInt(c.mode.options[c.mode.selectedIndex].value);
	var score1=parseFloat(c.input_pscore.value);
	if(isNaN(score1)) {
		print2console('Invalid positive threshold value',2);
		return;
	}
	if(score1<0) {
		print2console('Positive threshold value must be >=0',2);
		return;
	}
	var score2=parseFloat(c.input_nscore.value);
	if(isNaN(score2)) {
		print2console('Invalid negative threshold value',2);
		return;
	}
	if(score2>0) {
		print2console('Negative threshold value must be <=0',2);
		return;
	}
	_tmp.qtc={pfilterscore:score1,nfilterscore:score2};
	break;
case FT_bam_c:
	c=bbj.genome.custtk.ui_bam;
	_tmp.url=c.input_url.value.trim();
	_tmp.label=c.input_name.value;
	_tmp.mode=parseInt(c.mode.options[c.mode.selectedIndex].value);
	break;
case FT_anno_c:
	c=bbj.genome.custtk.ui_hammock;
	_tmp.url=c.input_url.value.trim();
	_tmp.label=c.input_name.value;
	_tmp.mode=parseInt(c.mode.options[c.mode.selectedIndex].value);
	var s=c.input_json.value;
	if(s.length>0) {
		var j=str2jsonobj(s);
		if(!j) {
			print2console('Syntax error with JSON description',2);
			return;
		}
		hammockjsondesc2tk(j,_tmp);
	}
	break;
case FT_weaver_c:
	c=bbj.genome.custtk.ui_weaver;
	_tmp.url=c.input_url.value.trim();
	_tmp.cotton=c.input_name.value;
	_tmp.label=c.cotton+' to '+bbj.genome.name;
	break;
default: fatalError('ft exception: '+ft);
}
if(bbj.genome.tkurlInUse(_tmp.url)) {
	print2console('This track has already been submitted',2);
	return;
}
if(newCustomTrack_isInvalid(_tmp)) {
	return;
}

if(ft==FT_weaver_c) {
	if(bbj.weaver && bbj.weaver.mode==W_fine) {
		/* already weaving in fine mode
		must refresh all other tracks especially the existing weavertk
		or else eerie things happen
		*/
		bbj.onloadend_once=function(){bbj.ajaxX(bbj.displayedRegionParam()+'&changeGF=on');};
	}
	bbj.init_bbj_param={tklst:[_tmp]};
	bbj.ajax_loadbbjdata(bbj.init_bbj_param);
	return;
}
c.submit_butt.disabled=true;
bbj.cloak();
bbj.genome.pending_custtkhash[_tmp.name]=_tmp;
print2console("Adding custom track...", 0);
bbj.ajax('addtracks=on&dbName='+bbj.genome.name+'&'+bbj.displayedRegionParamPrecise()+trackParam([_tmp]),function(data){bbj.submitCustomtrack_cb(data,_tmp,c);});
}


Browser.prototype.submitCustomtrack_cb=function(data,tk,ui)
{
ui.submit_butt.disabled=false;
this.unveil();
if(!data || data.brokenbeads) {
	print2console('Something about this track is broken. Please check your input.',2);
	menu_blank();
	dom_create('div',menu.c32,'margin:10px;width:200px;').innerHTML='Failed to add this track.<br><br>If this is an updated version of a previously used track, you need to refresh cache.';
	var d=dom_create('div',menu.c32,'margin:20px;');
	this.refreshcache_maketkhandle(d,tk);
	menu_show_beneathdom(0,ui.submit_butt);
	gflag.menu.bbj=apps.custtk.bbj;
	return;
}
this.jsonAddtracks(data);
done();
flip_panel(this.genome.custtk.buttdiv,this.genome.custtk.ui_submit,false);
apps.custtk.main.__hbutt2.style.display='none';
for(var tag in this.splinters) {
	this.splinters[tag].ajax_addtracks([tk]);
}
}

function newCustomTrack_isInvalid(hash)
{
/* first fetch url and name of custom track into global variables, 
then call the validation routine
*/
var url = hash.url;
if(url.length <= 0) {
	print2console("no URL given for custom track", 3);
	return true;
}
if(url.length <= 8) {
	print2console("URL looks invalid", 3);
	return true;
}
if(url.substr(0,4).toLowerCase()!='http' && url.substr(0,3).toLowerCase()!='ftp') {
	print2console("unrecognizable URL", 3);
	return true;
}
var label = hash.label;
if(label.length == 0) {
	print2console("no track name entered", 3);
	return true;
}
if(label.indexOf(',') != -1) {
	print2console("no comma allowed for track name", 2);
	return true;
}
if(label.indexOf('|') != -1) {
	print2console("no vertical line allowed for track name", 2);
	return true;
}
return false;
}



Genome.prototype.custtk_makeui=function(ft,holder)
{
var d=make_headertable(holder);
d.style.position='absolute';
d.style.left=0;
d.style.top=0;
d._c.style.padding='20px 30px';
var ftname;
switch(ft){
case FT_bedgraph_c:
	d._h.innerHTML='bedGraph track | <a href=http://washugb.blogspot.com/2012/09/generate-tabix-files-from-bigwig-files.html target=_blank>help</a>';
	ftname='bedGraph';
	break;
case FT_cat_c:
	d._h.innerHTML='Categorical track | <a href=http://washugb.blogspot.com/2013/08/v23-custom-categorical-track.html target=_blank>help</a>';
	ftname='categorical';
	break;
case FT_bed_c:
	d._h.innerHTML='Bed track | <a href=http://washugb.blogspot.com/2012/09/generate-tabix-files-from-bigbed-files.html target=_blank>help</a>';
	ftname='BED';
	break;
case FT_anno_c:
	d._h.innerHTML='Hammock track | <a href='+FT2noteurl[FT_anno_n]+' target=_blank>help</a>';
	ftname='hammock';
	break;
case FT_lr_c:
	d._h.innerHTML='Pairwise interaction track <a href=http://washugb.blogspot.com/2012/09/prepare-custom-long-range-interaction.html target=_blank>help</a>';
	ftname='long-range interaction';
	break;
case FT_sam_c:
	d._h.innerHTML='<a href=http://washugb.blogspot.com/2012/09/generate-tabix-file-from-bam-file.html target=_blank>help</a>';
	ftname='SAM';
	break;
case FT_huburl:
	d._h.innerHTML= 'Data hub | <a href='+FT2noteurl[FT_huburl]+' target=_blank>JSON format preferred</a>, <a href=http://washugb.blogspot.com/2013/11/v29-2-of-4-displaying-track-hubs-from.html target=_blank>UCSC format partially supported</a>';
	ftname='Datahub';
	break;
case FT_bigwighmtk_c:
	d._h.innerHTML='bigWig track | <a href=http://genome.ucsc.edu/goldenPath/help/bigWig.html target=_blank>help</a>';
	ftname='bigWig';
	break;
case FT_bam_c:
	d._h.innerHTML='BAM track | <a href=http://washugb.blogspot.com/2013/05/v18-new-page-look-bam-file-support.html target=_blank>help</a>';
	ftname='BAM';
	break;
case FT_weaver_c:
	d._h.innerHTML='Genomealign track | <a href='+FT2noteurl[FT_weaver_c]+' target=_blank>help</a>';
	ftname='Genomealign';
	break;
}

var table=dom_create('table',d._c);
table.style.whiteSpace='nowrap';
table.cellSpacing=10;
// row 1
var tr=table.insertRow(0);
var td=tr.insertCell(0);
td.align='right';
td.innerHTML=ftname+' file URL';
var td=tr.insertCell(1);
var inp=dom_create('input',td);
inp.type='text';
inp.size=40;
d.input_url=inp;
if(ft==FT_huburl) {
	// tabular or json?
	d.select=dom_addselect(td,null,[
		{value:'json',text:'JSON',selected:true},
		{value:'ucsctrackdb',text:'UCSC data hub'} ]);
}
// row 2
tr=table.insertRow(-1);
td=tr.insertCell(0);
td.align='right';
if(ft!=FT_huburl) {
	td.innerHTML=ft==FT_weaver_c?'Query genome name':'Track name';
}
td=tr.insertCell(1);
if(ft==FT_huburl) {
} else {
	inp=dom_create('input',td);
	inp.type='text';
	inp.size=20;
	d.input_name=inp;
}
dom_addbutt(td,'Clear',function(){d.input_url.value='';if(d.input_name) d.input_name.value='';});
// row 3
if(ft==FT_anno_c||ft==FT_bed_c||ft==FT_lr_c||ft==FT_sam_c||ft==FT_bam_c) {
	tr=table.insertRow(-1);
	td=tr.insertCell(0);
	td.align='right';
	td.innerHTML='Show as';
	td=tr.insertCell(1);
	var options=[
		{value:M_full,text:'full'},
		{value:M_thin,text:'thin'},
		];
	if(ft==FT_anno_c||ft==FT_bed_c||ft==FT_sam_c||ft==FT_bam_c) {
		options.push({value:M_den,text:'density'});
	} else if(ft==FT_lr_c) {
		options.unshift({value:M_trihm,text:'heatmap'});
		options.unshift({value:M_arc,text:'arc'});
	}
	d.mode=dom_addselect(td,null,options);
}
// row 4-5
if(ft==FT_anno_c) {
	tr=table.insertRow(-1);
	td=tr.insertCell(0);
	td.align='right';
	td.innerHTML='JSON descriptions<br><span style="font-size:70%;opacity:.7;">required when "category" or "scorelst"<br>attributes are used<br><a href='+FT2noteurl[FT_anno_n]+'#Compound_attributes target=_blank>learn more</a></span>';
	td=tr.insertCell(1);
	inp=dom_create('textarea',td);
	inp.rows=4;
	inp.cols=20;
	d.input_json=inp;
}
if(ft==FT_lr_c) {
	tr=table.insertRow(-1);
	td=tr.insertCell(0);
	td.align='right';
	td.innerHTML='Positive score cutoff';
	td=tr.insertCell(1);
	inp=dom_create('input',td);
	d.input_pscore=inp;
	inp.type='text';
	inp.size=3;
	inp.value=2;
	dom_addtext(td,'only applies to positively-scored items','#858585');
	tr=table.insertRow(-1);
	td=tr.insertCell(0);
	td.align='right';
	td.innerHTML='Negative score cutoff';
	td=tr.insertCell(1);
	inp=dom_create('input',td);
	d.input_nscore=inp;
	inp.type='text';
	inp.size=3;
	inp.value=-2;
	dom_addtext(td,'only applies to negatively-scored items','#858585');
}
if(ft==FT_cat_c) {
	tr=table.insertRow(-1);
	td=tr.insertCell(0);
	td.align='right';
	td.innerHTML='Number of categories';
	td=tr.insertCell(1);
	var ip=dom_create('input',td);
	ip.type='text';
	ip.value=5;
	ip.size=5;
	ip.addEventListener('change',custcate_idnum_change_input,false);
	d.category_idnum=ip;
	dom_addbutt(td,'set',custcate_idnum_change_input);
	tr=table.insertRow(-1);
	td=tr.insertCell(0);
	td.colSpan=2;
	var d2=dom_create('div',td,'display:table;margin:5px 100px;padding:5px 15px;border:solid 1px #ccc;');
	dom_addtext(d2,'Define categories of this track');
	d.category_table=dom_create('table',d2,'display:block;margin-top:10px;');
}
tr=table.insertRow(-1);
if(ft==FT_weaver_c) {
	td=tr.insertCell(0);
	td.align='right';
	td.innerHTML='Prebuilt alignments<div style="font-size:80%">source: <a href=http://genome.ucsc.edu target=_blank>UCSC Genome Browser</a></div>';
	d.weavertkholder= tr.insertCell(1);
	tr=table.insertRow(-1);
	tr.insertCell(0);
	td=tr.insertCell(1);
	d.submit_butt=dom_addbutt(td,'SUBMIT',submitCustomtrack);
	d.submit_butt.ft=ft;
} else {
	td=tr.insertCell(0);
	td.align='right';
	d.examplebutt=dom_addbutt(td,'Use example',function(){custtk_useexample(ft);});
	td=tr.insertCell(1);
	d.submit_butt=dom_addbutt(td,'SUBMIT',submitCustomtrack);
	d.submit_butt.ft=ft;
}
d.style.display='none';
return d;
}

function tkentryclick_simple(event) { event.target.className=event.target.className=='tkentry'?'tkentry_onfocus':'tkentry';}

Browser.prototype.tkCount=function()
{
var total=0, ctotal=0;
for(var k in this.genome.hmtk) {
	var t=this.genome.hmtk[k];
	if(!t.mastertk) {
		total++;
		if(!t.public && isCustom(t.ft)) {
			ctotal++;
		}
	}
}
return [total,ctotal];
}

/*** __custtk__ ends ***/


/* __cache__ */

function menu_refreshcache()
{
menu_blank();
dom_create('div',menu.c32,'margin:10px;width:200px;font-size:70%;opacity:.7;').innerHTML='Refreshing cache is necessary when you have updated the file(s) of this track.';
gflag.menu.bbj.refreshcache_maketkhandle(dom_create('div',menu.c32,'margin:20px;'),gflag.menu.tklst[0]);
}

Browser.prototype.refreshcache_maketkhandle=function(holder,tk)
{
var bbj=this;
if(tk.ft==FT_cm_c) {
	var d=dom_create('div',holder,'line-height:1.5;');
	dom_addtext(d,'Click member track to refresh cache:');
	for(var n in tk.cm.set) {
		var t=tk.cm.set[n];
		var s=dom_create('div',d,'color:blue;text-decoration:underline;cursor:default;');
		s.innerHTML=(n=='cg_f'?'Forward CG':
			n=='cg_r'?'Reverse CG':
			n=='chg_f'?'Forward CHG':
			n=='chg_r'?'Reverse CHG':
			n=='chh_f'?'Forward CHH':
			n=='chh_r'?'Reverse CHH':
			n=='rd_f'?'Forward read depth':
			n=='rd_r'?'Reverse read depth':'No!')+
			' &#187;';
		s.onclick=this.refreshcache_clickhandle_closure(t,s);
	}
	return;
}
if(tk.ft==FT_matplot) {
	var d=dom_create('div',holder,'line-height:1.5;');
	dom_addtext(d,'Click member track to refresh cache:');
	for(var i=0; i<tk.tracks.length; i++) {
		var t=tk.tracks[i];
		if(isCustom(t.ft)) {
			var s=dom_create('div',d,'color:blue;text-decoration:underline;cursor:default;');
			s.innerHTML=t.label+' &#187;';
			s.onclick=this.refreshcache_clickhandle_closure(t,s);
		}
	}
	return;
}
if(!tk.url) {
	dom_addtext(holder,'No URL found for this track, cannot refresh cache.');
	return;
}
var s=dom_create('div',holder,'color:blue;text-decoration:underline;cursor:default;');
s.innerHTML='Refresh cache &#187;';
s.onclick=function(){bbj.refreshcache_clickhandle(tk,s);};
}

Browser.prototype.refreshcache_clickhandle_closure=function(tk,s)
{
var bbj=this;
return function(){bbj.refreshcache_clickhandle(tk,s);};
}

Browser.prototype.refreshcache_clickhandle=function(tk,handle,callback)
{
handle.innerHTML='Please wait...';
var files,dirs;
switch(tk.ft) {
case FT_bigwighmtk_c:
	// bigwig is in /tmp/udcCache, damned if it's not
	files=['/tmp/udcCache/'+tk.url.replace('://','/')+'/bitmap',
			'/tmp/udcCache/'+tk.url.replace('://','/')+'/sparseData'];
	dirs=['/tmp/udcCache/'+tk.url.replace('://','/')];
	break;
case FT_bam_c:
	var l2=tk.url.split('/');
	files=[gflag.trashDir+'/'+tk.url.replace('://',':/')+'/'+l2[l2.length-1]+'.bai'];
	dirs=[gflag.trashDir+'/'+tk.url.replace('://',':/')];
default:
	// tabix
	var tmp=tk.url.split('/');
	var fn=tmp[tmp.length-1];
	files=[gflag.trashDir+'/'+tk.url.replace('://',':/')+'/'+fn+'.tbi'];
}
var bbj=this;
var r=this.regionLst[0];
this.ajax('refreshcusttkcache=on&url='+tk.url+'&ft='+tk.ft+
	(files?'&filelst='+files.join(','):'')+
	(dirs?'&dirlst='+dirs.join(','):'')+
	'&chrom='+r[0]+'&start='+r[3],function(data){bbj.refreshcache_done(data,tk,handle,callback);});
}
Browser.prototype.refreshcache_done=function(data,tk,handle,callback)
{
if(!data || data.error) {
	handle.innerHTML='<div style="white-space:nowrap;font-size:70%;margin:10px;">CANNOT refresh cache for this track (broken URL?)<br>Data type: '+FT2verbal[tk.ft]+'<br>URL: <a href='+tk.url+' target=_blank>'+tk.url+'</a></div>';
	return;
}
handle.innerHTML='<span class=g>&#10004; Done!</span>';
if(callback) {
	callback();
} else {
	this.ajax_addtracks([tk]);
}
}


/* __cache__ */




/*** __hub__ */

Genome.prototype.publichub_makehandle=function(hub,holder)
{
var table=dom_create('table',holder,'display:inline-block;margin:15px 15px 15px 0px;background-color:'+colorCentral.background_faint_5);
table.cellPadding=10;
table.cellSpacing=0;
if(hub.hublist) {
	table.style.borderTop='2px solid white';
}
var tr=table.insertRow(0);
var td0=tr.insertCell(0);
td0.className='clb4';
dom_addtext(td0,hub.name);
dom_addtext(td0,'&nbsp;&nbsp;'+
	(hub.hublist?(hub.hublist.length+' hubs'):(hub.trackcount?(hub.trackcount+' tracks'):'')),
	colorCentral.foreground_faint_5);
var td1=tr.insertCell(1);
if(hub.hublist) {
	td1.style.display='none';
} else {
	td1.align='right';
	dom_addbutt(td1,'&nbsp; Load &nbsp;',publichub_load_closure(hub.id));
}
tr=table.insertRow(1);
tr.style.display='none';
td0.onclick=publichub_detail_closure(tr);
var td=tr.insertCell(0);
td.colSpan=2;
var d=dom_create('div',td,'position:relative;width:'+(hub.hublist?700:600)+'px;');
if(hub.logo) {
	var img=dom_create('img',d,'display:block;position:absolute;left:0px;top:0px;opacity:0.1;');
	img.src=hub.logo;
}
dom_create('div',d,'margin:5px 20px 10px 20px;').innerHTML=hub.desc;
if(hub.institution) {
	var d3=dom_create('div',d,'margin:10px 20px;');
	for(var j=0; j<hub.institution.length; j++) {
		dom_create('div',d3,'display:inline-block;white-space:nowrap;margin-right:10px;').innerHTML=hub.institution[j];
	}
}
if(hub.cite) {
	var d3=dom_create('table',d,'margin:10px 20px;');
	var tr4=d3.insertRow(0);
	var td4=tr4.insertCell(0);
	td4.vAlign='top';
	td4.innerHTML='Please cite:';
	td4=tr4.insertCell(1);
	td4.innerHTML=hub.cite.join('<br>');
}
if(hub.hublist) {
	var d2=dom_create('div',d,'margin:10px 20px;');
	dom_create('div',d2,'margin-top:20px;').innerHTML='This collection has following hubs:';
	return d2;
} else {
	this.publichub.lst.push({says:td1,url:hub.url,id:hub.id});
}
}

function publichub_detail_closure(tr)
{
return function(){publichub_detail(tr);};
}
function publichub_detail(d)
{
if(d.style.display=='none') {
	d.style.display='table-row';
} else {
	d.style.display='none';
}
}
function publichub_load_closure(hubid)
{
return function(){publichub_load_page(hubid);};
}

function publichub_load_page(hubid)
{
apps.publichub.bbj.publichub_load(hubid);
}

Browser.prototype.publichub_load=function(hubid)
{
for(var i=0; i<this.genome.publichub.lst.length; i++) {
	var h=this.genome.publichub.lst[i];
	if(h.id==hubid) {
		var butt=h.says.firstChild;
		if(butt.tagName=='BUTTON') butt.disabled=true;
		this.loadhub_urljson(h.url,function(){h.says.innerHTML=' <span class=clb onclick="apps.publichub.bbj.toggle8();apps.publichub.bbj.toggle1()">Loaded &#187;</span>';});
		return;
	}
}
print2console('Unknown publichub identifier: '+hubid,2);
this.ajax_loadbbjdata(this.init_bbj_param);
}

Browser.prototype.loaddatahub_pushbutt=function()
{
var ui=this.genome.custtk.ui_hub;
var url=ui.input_url.value;
if(url.length==0 || url=='Enter URL of hub descriptor file') {
	print2console('URL to hub descriptor file required', 2);
	return;
}
ui.submit_butt.disabled=true;
print2console('Loading data hub...',0);
this.cloak();
var which=ui.select.options[ui.select.selectedIndex].value;
if(which=='json') {
	this.loadhub_urljson(url);
} else {
	this.loaddatahub_ucsc(url);
}
}




function jsonhub_upload(event)
{
gflag.fileupload_bbj=apps.custtk.bbj;
var p=event.target;
while(p.className!='largebutt') p=p.parentNode;
simulateEvent(p.previousSibling,'click');
}




function jsonhub_choosefile(event)
{
var reader=new FileReader();
reader.onerror=function(){print2console('Error reading file',2);}
reader.onabort=function(){print2console('Error reading file',2);}
reader.onload=function(e) {
	var j=parse_jsontext(e.target.result);
	if(!j) {
		return;
	}
	if(apps.custtk.main.style.display=='block') { toggle7_2();}
	var b=gflag.fileupload_bbj;
	b.loaddatahub_json(j);
};
reader.readAsText(event.target.files[0]);
}



Browser.prototype.loadhub_urljson=function(url,callback)
{
/* load datahub from json text file by url
oh, must use trunk please..
*/
var bbj=this.trunk?this.trunk:this;
bbj.shieldOn();
bbj.cloak();
bbj.ajaxText('loaddatahub=on&url='+url, function(text){bbj.loadhub_urljson_cb(text,url,callback);}
);
}

Browser.prototype.loadhub_urljson_cb=function(text,url,callback)
{
if(this.genome.custtk) {
	this.genome.custtk.ui_hub.submit_butt.disabled=false;
}
if(!text) {
	print2console('Cannot load this hub: '+url,2);
} else {
	var j=parse_jsontext(text);
	if(j) {
		this.loaddatahub_json(j,url);
		if(apps.custtk && apps.custtk.main.style.display=='block') { toggle7_2(); }
		/* this callback is currently only used for public hubs
		*/
		if(callback) {
			callback();
		}
		return;
	} else {
		print2console('Invalid JSON from this hub: '+url,2);
	}
}
this.ajax_loadbbjdata(this.init_bbj_param);
}


function jsontext_removecomment(t)
{
var lines=t.split('\n');
if(lines.length==0) return null;
var nlst=[];
for(var i=0; i<lines.length; i++) {
	var l=lines[i].trim();
	if(l[0]=='#') continue;
	nlst.push(l);
}
return nlst.join('');
}

function parse_jsontext(text)
{
if(!text) return null;
var t2=jsontext_removecomment(text);
if(!t2) return null;
try {
	var j=eval('('+t2+')');
} catch(err) {
	return null;
}
return j;
}

function hubtagistrack(tag)
{
// this supports longrange to be backward compatible
if(tag=='bedgraph' || tag=='bigwig' || tag=='bed' || 
tag=='longrange' || tag=='interaction' ||
tag=='bam' || tag=='categorical' ||
tag=='methylc'||tag=='ld'||
tag=='annotation'||tag=='hammock'||
tag=='categorymatrix'||
tag=='quantitativecategoryseries'||
tag=='genomealign' ||
tag=='matplot'
) return true;
return false;
}



Browser.prototype.parse_custom_track=function(obj)
{
// mode
var tmp=parse_tkmode(obj.mode);
var m=tmp[0];
if(tmp[1]) {
	// mode error
	print2console(tmp[1]+' ('+obj.label+')',2);
}
var tag=obj.type.toLowerCase();
switch(tag){
case 'bedgraph':
	obj.ft=FT_bedgraph_c;
	if(m!=M_hide) {
		m=M_show;
	}
	break;
case 'bigwig':
	obj.ft=FT_bigwighmtk_c;
	if(m!=M_hide) {
		m=M_show;
	}
	break;
case 'bed':
	obj.ft=FT_bed_c;
	if(m==M_show||m==M_arc||m==M_trihm) {
		m=M_full;
	}
	break;
case 'longrange':
case 'interaction':
	obj.ft=FT_lr_c;
	if(m==M_show) {
		m=M_arc;
	}
	break;
case 'bam':
	obj.ft=FT_bam_c;
	if(m==M_show||m==M_arc||m==M_trihm) {
		m=M_den;
	}
	break;
case 'categorical':
	obj.ft=FT_cat_c;
	if(m!=M_hide) {
		m=M_show;
	}
	break;
case 'methylc':
	obj.ft=FT_cm_c;
	if(m!=M_hide) {
		m=M_show;
	}
	break;
case 'matplot':
	obj.ft=FT_matplot;
	if(m!=M_hide) {
		m=M_show;
	}
	break;
case 'ld':
	obj.ft=FT_ld_c;
	if(m!=M_hide) {
		m=M_trihm;
	}
	break;
case 'annotation':
case 'hammock':
	obj.ft=FT_anno_c;
	if(m==M_show||m==M_arc||m==M_trihm) {
		m=M_full;
	}
	break;
case 'genomealign':
	obj.ft=FT_weaver_c;
	if(!obj.querygenome) {
		print2console('Query genome missing from '+FT2verbal[FT_weaver_c]+' track',2);
		return null;
	}
	obj.cotton=obj.querygenome;
	delete obj.querygenome;
	m=M_full;
	if(!obj.name) obj.name=obj.cotton+' to '+this.genome.name;
	obj.weaver={mode:W_fine};
	if(!obj.qtc) {obj.qtc={};}
	obj.qtc.stackheight=weavertkstackheight;
	break;
case 'categorymatrix':
	if(!obj.rowcount) {
		print2console('"rowcount" missing from catmat',2);
		return null;
	}
	if(typeof(obj.rowcount)!='number') {
		print2console('Invalid rowcount from catmat, must be integer',2);
		return null;
	}
	if(!obj.rowheight || typeof(obj.rowheight)!='number') {
		print2console('Invalid or missing "rowheight" from catmat',2);
		return null;
	}
	obj.ft=FT_catmat;
	if(m!=M_hide) {
		m=M_show;
	}
	break;
case 'quantitativecategoryseries':
	obj.ft=FT_qcats;
	if(m!=M_hide) {
		m=M_show;
	}
	break;
}
obj.mode=m;
if(this.init_bbj_param && this.init_bbj_param.forceshowallhubtk) {
	obj.mode=tkdefaultMode(obj);
}

if(!obj.name) {
	obj.name='Unamed hub track';
}
obj.label=obj.name.replace(/,/g,' ');
if(obj.url && this.genome.tkurlInUse(obj.url)) {
	// XXXb
	for(var n in this.genome.hmtk) {
		var t2=this.genome.hmtk[n];
		if(t2.url==obj.url) {
			obj.name=t2.name;
			break;
		}
	}
} else {
	obj.name= this.genome.newcustomtrackname();
}

if(obj.ft==FT_cm_c) {
	if(!obj.tracks) {
		var msg='methylC track "'+obj.label+'" is dropped for missing the "tracks" attribute"';
		print2console(msg,2);
		alertbox_addmsg({text:msg});
		return null;
	}
	if(!obj.tracks.forward) {
		var msg='methylC track "'+obj.label+'" is dropped for missing essential parameter ".tracks.forward"';
		print2console(msg,2);
		alertbox_addmsg({text:msg});
		return null;
	}
	if(!obj.tracks.forward.ReadDepth) {
		var msg='methylC track "'+obj.label+'" is dropped for missing essential member track ".tracks.forward.ReadDepth"';
		print2console(msg,2);
		alertbox_addmsg({text:msg});
		return null;
	}
	if(!obj.tracks.forward.CG) {
		var msg='methylC track "'+obj.label+'" is dropped for missing essential member track ".tracks.forward.CG"';
		print2console(msg,2);
		alertbox_addmsg({text:msg});
		return null;
	}
	/* restrict, if any of the member track has been loaded, reject
	*/
	for(var n in obj.tracks.forward) {
		var u=obj.tracks.forward[n].url;
		if(!u) {
			var msg='methylC track "'+obj.label+'" is dropped for missing track file URL for the member track '+n+'/forward';
			print2console(msg,2);
			alertbox_addmsg({text:msg});
			return null;
		}
		if(this.genome.tkurlInUse(u)) {
			var msg='methylC track "'+obj.label+'" problem: track file url of member track '+n+'/forward is already in use.';
			print2console(msg,2);
			alertbox_addmsg({text:msg+' A track file URL cannot be used at multiple places in the same session. One way to get around this issue is to duplicate this file by soft-linking it to a new file name and obtain a new file URL.'});
			return null;
		}
	}
	if(obj.tracks.reverse) {
		for(var n in obj.tracks.reverse) {
			var u=obj.tracks.reverse[n].url;
			if(!u) {
				var msg='methylC track "'+obj.label+'" lacks track file URL for the member track '+n+'/reverse';
				print2console(msg,2);
				alertbox_addmsg({text:msg});
				return null;
			}
			if(this.genome.tkurlInUse(u)) {
				var msg='methylC track '+obj.label+' problem: track file url of member track '+n+'/reverse already in use.';
				print2console(msg,2);
				alertbox_addmsg({text:msg+' A track file URL cannot be used at multiple places in the same session. One way to get around this issue is to duplicate this file by soft-linking it to a new file name and obtain a new file URL.'});
				return null;
			}
		}
	}
	obj.cm={set:{},color:{},bg:{}};
	if(obj.combinestrands!=undefined) {
		obj.cm.combine=obj.combinestrands;
		delete obj.combinestrands;
	} else {
		obj.cm.combine=false;
	}
	if(obj.combinestrands_chg!=undefined) {
		obj.cm.combine_chg=obj.combinestrands_chg;
		delete obj.combinestrands_chg;
	} else {
		obj.cm.combine_chg=false;
	}
	obj.cm.scale=obj.scalebarheight;
	delete obj.scalebarheight;
	if(obj.filterreaddepth==undefined) {
		obj.cm.filter=0;
	} else if(isNaN(obj.filterreaddepth) || obj.filterreaddepth<=0) {
		print2console('value for "filterreaddepth" should be positive integer',2);
		obj.cm.filter=0;
	} else {
		obj.cm.filter=obj.filterreaddepth;
		delete obj.filterreaddepth;
	}

	var x=obj.tracks.forward.ReadDepth;
	obj.cm.set.rd_f= { ft:FT_bedgraph_c,
		name:this.genome.newcustomtrackname(),
		label:'read depth - forward',
		url:x.url,
		mode:obj.mode,
		qtc:{summeth:summeth_mean},
		mastertk:obj.name,
		};
	obj.cm.color.rd_f=x.color;

	x=obj.tracks.forward.CG;
	obj.cm.set.cg_f= { ft:FT_bedgraph_c,
		name:this.genome.newcustomtrackname(),
		label:'CG - forward',
		url:x.url,
		mode:obj.mode,
		qtc:{summeth:summeth_mean},
		mastertk:obj.name,
		};
	obj.cm.color.cg_f=x.color;
	obj.cm.bg.cg_f=x.bg;

	if(obj.tracks.forward.CHG) {
		x=obj.tracks.forward.CHG;
		obj.cm.set.chg_f= { ft:FT_bedgraph_c,
			name:this.genome.newcustomtrackname(),
			label:'CHG - forward',
			url:x.url,
			mode:obj.mode,
			qtc:{summeth:summeth_mean},
			mastertk:obj.name,
			};
		obj.cm.color.chg_f=x.color;
		obj.cm.bg.chg_f=x.bg;
	}
	if(obj.tracks.forward.CHH) {
		x=obj.tracks.forward.CHH;
		obj.cm.set.chh_f= { ft:FT_bedgraph_c,
			name:this.genome.newcustomtrackname(),
			label:'CHH - forward',
			url:x.url,
			mode:obj.mode,
			qtc:{summeth:summeth_mean},
			mastertk:obj.name,
			};
		obj.cm.color.chh_f=x.color;
		obj.cm.bg.chh_f=x.bg;
	}
	if(obj.tracks.reverse) {
		if(!obj.tracks.reverse.ReadDepth) {
			print2console('missing ".tracks.reverse.ReadDepth" in methylC track',2);
			return null;
		}
		if(!obj.tracks.reverse.CG) {
			print2console('missing ".tracks.reverse.CG" in methylC track',2);
			return null;
		}
		x=obj.tracks.reverse.ReadDepth;
		obj.cm.set.rd_r= { ft:FT_bedgraph_c,
			name:this.genome.newcustomtrackname(),
			label:'read depth - reverse',
			url:x.url,
			mode:obj.mode,
			qtc:{summeth:summeth_mean},
			mastertk:obj.name,
			};
		obj.cm.color.rd_r=x.color;

		x=obj.tracks.reverse.CG;
		obj.cm.set.cg_r= { ft:FT_bedgraph_c,
			name:this.genome.newcustomtrackname(),
			label:'CG - reverse',
			url:x.url,
			mode:obj.mode,
			qtc:{summeth:summeth_mean},
			mastertk:obj.name,
			};
		obj.cm.color.cg_r=x.color;
		obj.cm.bg.cg_r=x.bg;

		if(obj.tracks.reverse.CHG) {
			x=obj.tracks.reverse.CHG;
			obj.cm.set.chg_r= { ft:FT_bedgraph_c,
				name:this.genome.newcustomtrackname(),
				label:'CHG - reverse',
				url:x.url,
				mode:obj.mode,
				qtc:{summeth:summeth_mean},
				mastertk:obj.name,
				};
			obj.cm.color.chg_r=x.color;
			obj.cm.bg.chg_r=x.bg;
		}
		if(obj.tracks.reverse.CHH) {
			x=obj.tracks.reverse.CHH;
			obj.cm.set.chh_r= { ft:FT_bedgraph_c,
				name:this.genome.newcustomtrackname(),
				label:'CHH - reverse',
				url:x.url,
				mode:obj.mode,
				qtc:{summeth:summeth_mean},
				mastertk:obj.name,
				};
			obj.cm.color.chh_r=x.color;
			obj.cm.bg.chh_r=x.bg;
		}
	}
} else if(obj.ft==FT_matplot) {
	if(!obj.tracks) {
		print2console('matplot track lacks "tracks" attribute"',2);
		return null;
	}
	/* restrict, if any of the member track has been loaded, reject
	*/
	var newlst=[];
	for(var i=0; i<obj.tracks.length; i++) {
		var t=obj.tracks[i];
		if(!t.url) {
			print2console('missing member track URL of '+t.name+' in '+obj.label,2);
			return null;
		}
		if(this.genome.tkurlInUse(t.url)) {
			// XXXb
					var f=false;
					for(var j=0; j<this.tklst.length; j++) {
						if(this.tklst[j].url==t.url) {
							f=true;
							break;
						}
					}
					if(f) {
			print2console('cannot load '+obj.label+', member track '+t.name+' already in use',2);
			print2console('try duplicating this file by softlinking it to get around this issue',0);
			return null;
			}
		}
		var t2=this.parse_custom_track(t);
		if(!t2) {
			print2console('cannot load '+obj.label+': invalid member track '+t.name,2);
			return null;
		}
		t2.mastertk=obj.name;
		newlst.push(t2);
	}
	obj.tracks=newlst;
} else {
	if(!obj.url) {
		print2console('datahub track lacks URL: '+obj.label,2);
		return null;
	}
	// TODO redundant tkurl from this hub
	if(!this.mustaddcusttk) {
		// XXXb
		if(this.genome.tkurlInUse(obj.url)) {
			var f=false;
			for(var i=0; i<this.tklst.length; i++) {
				if(this.tklst[i].url==obj.url) {
					f=true;
					break;
				}
			}
			if(f) {
				print2console('This hub track already exists: '+obj.url,2);
				return null;
			}
		}
	}
}
if(!obj.md) { obj.md=[]; }
if(obj.metadata) {
	for(var mdkey in obj.metadata) {
		if(!(mdkey in this.__hubmdvlookup)) {
			print2console('Invalid metadata for track annotation: '+mdkey,2);
			continue;
		}
		var mdvidx=this.__hubmdvlookup[mdkey];
		if(!gflag.mdlst[mdvidx]) {
			print2console('!! mdv cannot be found by idx: '+mdvidx,2);
			continue;
		}
		var c2p=gflag.mdlst[mdvidx].c2p;
		var md={};
		if(Array.isArray(obj.metadata[mdkey])) {
			for(var i=0; i<obj.metadata[mdkey].length; i++) {
				var term=obj.metadata[mdkey][i];
				if(term in c2p) {
					md[term]=1;
				} else {
					print2console('track '+obj.label+' has unknown term id ('+term+') for '+mdkey,2);
				}
			}
		} else {
			var term=obj.metadata[mdkey];
			if(term in c2p) {
				md[term]=1;
			} else {
				print2console('track '+obj.label+' has unknown term id ('+term+') for '+mdkey,2);
			}
		}
		obj.md[mdvidx]=md;
	}
	delete obj.metadata;
}
// set internal md, so that it will show up in facet
var mdi=getmdidx_internal();
var a={};
a[FT2verbal[obj.ft]]=1;
if(obj.ft==FT_weaver_c) {
	a[obj.cotton]=1;
} else {
	a[this.genome.name]=1;
}
obj.md[mdi]=a;

if(obj.categories) {
	obj.cateInfo=obj.categories;
	delete obj.categories;
}
// TODO ensembl accession
if(obj.geo) {
	if(typeof(obj.geo)=='string') {
		obj.geolst=obj.geo.split(',');
	} else if(Array.isArray(obj.geo)) {
		obj.geolst=obj.geo;
	}
	delete obj.geo;
}
if(obj.details_text) {
	obj.details={};
	tkinfo_parse(obj.details_text,obj.details);
}
if(obj.group!=undefined) {
	var _g=parseInt(obj.group);
	if(isNaN(_g)) {
		print2console('Value of group attribute must be non-negative integer',2);
		delete obj.group;
	} else {
		obj.group=_g;
	}
}
parseHubtrack(obj);
if(obj.ft==FT_cm_c) {
	// for cmtk, may apply smoothing to read depth tracks
	if(obj.qtc.smooth) {
		// cmtk smoothing applies to read depth data
		if(obj.cm.set.rd_f) {
			obj.cm.set.rd_f.qtc.smooth=obj.qtc.smooth;
		}
		if(obj.cm.set.rd_r) {
			obj.cm.set.rd_r.qtc.smooth=obj.qtc.smooth;
		}
	}
	delete obj.qtc.summeth;
}
return obj;
}

Genome.prototype.parse_native_track=function(t)
{
if(!t.name) {
	print2console('Native track missing name',2);
	return null;
}
var oo=this.getTkregistryobj(t.name);
if(!oo) {
	print2console('Unknown native track: '+t.name,2);
	return null;
}
t.ft=oo.ft;
t.label=oo.label;
if(oo.url) {
	t.url=oo.url;
}
var tmp=parse_tkmode(t.mode);
if(tmp[1]) {
	print2console(tmp[1]+': '+t.label,2);
}
t.mode=tmp[0];
switch(t.ft) {
case FT_bed_n:
	if(t.mode==M_show) t.mode=M_full;
	break;
case FT_anno_n:
	if(t.mode==M_show) t.mode=M_full;
	break;
}

parseHubtrack(t);
if(t.qtc) {
	// for restoring session
	if(!oo.qtc) {oo.qtc={}};
	qtc_paramCopy(t.qtc,oo.qtc);
}
if(t.categories) {
	cateInfo_copy(t.categories,oo.cateInfo);
}
return t;
}

Browser.prototype.loaddatahub_json=function(json,sourcehub)
{
/** __jhub__ parsing a big json blob for:
- loading datahub
- recovering session
- embed

sourcehub: either url or file name

attributes may come in as raw or cooked
*/
// need genome to validate native tk
if(!this.genome) fatalError('Cannot parse hub: genome is not ready');

// brush off
var err_notype=0;
var i=0;
while(i<json.length) {
	var o=json[i];
	if(!o.type) {
		err_notype++;
		json.splice(i,1);
	} else {
		o.type=o.type.toLowerCase();
		i++;
	}
}
if(err_notype) {
	print2console(err_notype+' items without type attribute dropped from hub',2);
}

// check for duplicating tkurl
var uh={};
var i=0;
while(i<json.length) {
	var o=json[i];
	if(hubtagistrack(o.type)) {
		if(o.url) {
			if(o.url in uh) {
				var m='Track with duplicating URL removed: '+o.name+' '+o.url;
				print2console(m,1);
				alertbox_addmsg({text:m});
				json.splice(i,1);
				continue;
			} else {
				uh[o.url]=1;
			}
		}
	}
	i++;
}

/* initiate param
*/
if(!this.init_bbj_param) {
	this.init_bbj_param={};
}
var ibp=this.init_bbj_param;
if(!ibp.tklst) {
	ibp.tklst=[];
}
if(!ibp.cmtk) {
	ibp.cmtk=[];
}
if(!ibp.matplot) {
	ibp.matplot=[];
}
if(!ibp.mcm_termlst) {
	ibp.mcm_termlst=[];
}
if(!ibp.track_order) {
	ibp.track_order=[];
}

/* compatible with single-vocabulary case
simply convert to vocabulary_set/metadata and get done with it
"mdkey" is reserved word
*/
var convertmd=false;
var md_obj=null;
for(var i=0; i<json.length; i++) {
	var obj=json[i];
	if(obj.type!='metadata') continue;
	/*** the metadata object must not be deleted!!
	or else shared mdobj won't be put in __hubmdvlookup
	*/
	md_obj=obj;
	if(!obj.vocabulary_set) obj.vocabulary_set={};
	if(obj.vocabulary) {
		obj.vocabulary_set.mdkey={
			vocabulary:obj.vocabulary,
			terms:obj.terms,
			source:sourcehub,
		};
		delete obj.vocabulary;
		if(obj.show_terms) {
			obj.show_terms={mdkey:obj.show_terms};
		} else if(obj.show) {
			obj.show_terms={mdkey:obj.show};
			delete obj.show;
		}
		convertmd=true;
	} else if(obj.vocabulary_file_url) {
		obj.vocabulary_set.mdkey=obj.vocabulary_file_url;
		if(obj.show_terms) {
			obj.show_terms={mdkey:obj.show_terms};
		} else if(obj.show) {
			obj.show_terms={mdkey:obj.show};
			delete obj.show;
		}
		convertmd=true;
		delete obj.vocabulary_file_url;
	}
	break;
}
if(convertmd) {
	// deal with obsolete track md attributes
	var err1=0, err2=0;
	for(var i=0; i<json.length; i++) {
		var obj=json[i];
		if(!hubtagistrack(obj.type)) continue;
		if(obj.annotation) {
			err1++;
		} else if(obj.custom_annotation) {
			// backward compatible
			err2++;
			obj.metadata={mdkey:obj.custom_annotation};
			delete obj.custom_annotation;
		} else if(obj.metadata) {
			var v=obj.metadata;
			obj.metadata={mdkey:v};
		}
	}
	if(err1) {
		alertbox_addmsg({text:'Obsolete attribute "annotation" is found in '+err1+' tracks, use shared metadata instead.<br>See '+FT2noteurl.md});
	}
	if(err2) {
		alertbox_addmsg({text:'Obsolete attribute "custom_annotation" is found in '+err2+' tracks, use "metadata" attribute instead.<br>See '+FT2noteurl.md});
	}
}

var mdi=getmdidx_internal();
if(mdi!=-1) this.__hubmdvlookup[literal_imd]=mdi;

if(md_obj) {
	// process metadata, load mdv from url
	// process object first (private md)
	for(var mdkey in md_obj.vocabulary_set) {
		var md=md_obj.vocabulary_set[mdkey];
		if(typeof(md)=='object') {
			if(!md.source) {
				md.source=sourcehub;
			}
			var midx=load_metadata_json(md);
			this.__hubmdvlookup[mdkey]=midx;
			delete md_obj.vocabulary_set[mdkey];
		}
	}
	// process url (shared md)
	for(var mdkey in md_obj.vocabulary_set) {
		var mdurl=md_obj.vocabulary_set[mdkey];
		if(!typeof(mdurl)=='string') {
			print2console('expecting url of shared md but got '+typeof(mdurl),2);
			continue;
		}
		var miss=true;
		for(var j=0; j<gflag.mdlst.length; j++) {
			var m=gflag.mdlst[j];
			if(m.sourceurl && m.sourceurl==mdurl) {
				this.__hubmdvlookup[mdkey]=j;
				miss=false;
				delete md_obj.vocabulary_set[mdkey];
				break;
			}
		}
		if(miss) {
			if(mdurl in this.__hubfailedmdvurl) {
				// failed, do not load it
				delete this.__hubmdvlookup[mdurl];
			} else {
				// load it then
				print2console('Loading shared metadata...',0);
				this.__pending_hubjson=json;
				this.load_metadata_url(mdurl);
				return;
			}
		}
	}
	if(md_obj.show_terms) {
		for(var mdkey in md_obj.show_terms) {
			var mdidx=this.__hubmdvlookup[mdkey];
			if(mdidx==undefined) {
				print2console('Unrecognized show_terms type: '+mdkey,2);
				continue;
			}
			var mdobj=gflag.mdlst[mdidx];
			var showterm=[];
			if(Array.isArray(md_obj.show_terms[mdkey])) {
				for(var j=0; j<md_obj.show_terms[mdkey].length; j++) {
					var term=md_obj.show_terms[mdkey][j];
					if(term in mdobj.c2p || term in mdobj.p2c) {
						showterm.push(term);
					} else {
						print2console('Unrecognized '+mdkey+' term: '+term,2);
					}
				}
			} else {
				var term=md_obj.show_terms[mdkey];
				if(term in mdobj.c2p || term in mdobj.p2c) {
					showterm.push(term);
				} else {
					print2console('Unrecognized '+mdkey+' term: '+term,2);
				}
			}
			if(showterm.length>0) {
				// check if the term has already been shown
				for(var k=0; k<showterm.length; k++) {
					var st=showterm[k];
					var shown=false;
					for(var i=0; i<this.mcm.lst.length; i++) {
						var t=this.mcm.lst[i];
						if(t[0]==st && t[1]==mdidx) {
							shown=true;
							break;
						}
					}
					if(!shown) {
						this.mcm.lst.push([st,mdidx]);
					}
				}
			}
		}
	}
	if(md_obj.facet_table && this.facet) {
		var k1=md_obj.facet_table[0];
		if(k1) {
			var id1=this.__hubmdvlookup[k1];
			if(id1==undefined) {
				print2console('Unknown key for facet table: '+k1,2);
			} else {
				this.facet.dim1.mdidx=id1;
				for(var n in gflag.mdlst[id1].root) {
					this.facet.dim1.term=n;
					break;
				}
			}
		}
		var k2=md_obj.facet_table[1];
		if(k2) {
			var id2=this.__hubmdvlookup[k2];
			if(id2==undefined) {
				print2console('Unknown key for facet table: '+k2,2);
			} else {
				this.facet.dim2.mdidx=id2;
				for(var n in gflag.mdlst[id2].root) {
					this.facet.dim2.term=n;
					break;
				}
			}
		}
	}
}

var gslst=[]; // adding gene set not handled in ibp

/* find category set
*/
var category_set=null,
	err_tkcat1=0,
	err_tkcat2=0;
for(var i=0; i<json.length; i++) {
	var obj=json[i];
	if(!obj.type) continue;
	if(obj.type=='category_set') {
		if(!obj.set) {
			print2console('set is missing from category_set',2);
		} else {
			category_set=obj.set;
		}
		json.splice(i,1);
		break;
	}
}


/* go over list again to process all stuff
all custom tracks go into ghm (where=1), natives go under it (where=2)
*/
for(var i=0; i<json.length; i++) {
	var obj=json[i];
	var tag=obj.type;
	if(hubtagistrack(tag)) {
		var tk=this.parse_custom_track(obj);
		if(!tk) {
			continue;
		}
		if(tk.category_set_index!=undefined) {
			if(!category_set) {
				err_tkcat1++;
			} else {
				if(tk.category_set_index in category_set) {
					tk.cateInfo={};
					cateInfo_copy(category_set[tk.category_set_index],tk.cateInfo);
					delete tk.category_set_index;
				} else {
					err_tkcat2++;
				}
			}
		}
		if(tk.ft==FT_cm_c) {
			// compound
			if(tk.mode==M_hide) {
				this.genome.registerCustomtrack(tk);
				for(var tn in tk.cm.set) {
					var mt=tk.cm.set[tn];
					this.genome.registerCustomtrack(mt);
					tk.cm.set[tn]=mt.name;
				}
			} else {
				ibp.cmtk.push(tk);
				ibp.track_order.push({name:tk.name,where:1});
				for(var tn in tk.cm.set) {
					var mt=tk.cm.set[tn];
					ibp.tklst.push(mt);
					tk.cm.set[tn]=mt.name;
				}
			}
		} else if(tk.ft==FT_matplot) {
			// compound
			var namelst=[];
			if(tk.mode==M_hide) {
				for(var j=0; j<tk.tracks.length; j++) {
					var mt=tk.tracks[j];
					this.genome.registerCustomtrack(mt);
					namelst.push(mt.name);
				}
			} else {
				ibp.matplot.push(tk);
				ibp.track_order.push({name:tk.name,where:1});
				for(var j=0; j<tk.tracks.length; j++) {
					var mt=tk.tracks[j];
					mt.mode=tkdefaultMode(mt);
					if(mt.mode!=M_show) {
						mt.mode=M_den;
					}
					ibp.tklst.push(mt);
					namelst.push(mt.name);
				}
			}
			tk.tracks=namelst;
			if(tk.mode==M_hide) {
				this.genome.registerCustomtrack(tk);
			}
		} else {
			// all the other types
			if(tk.mode==M_hide) {
				this.genome.registerCustomtrack(tk);
			} else {
				ibp.tklst.push(tk);
				ibp.track_order.push({name:tk.name,where:1});
			}
		}
		if(tk.ft==FT_weaver_c && tk.tracks) {
			// pending cotton tracks
			if(!Array.isArray(tk.tracks)) {
				print2console(FT2verbal[FT_weaver_c]+' .tracks must be an array',2);
			} else {
				// cottonbbj has not been made, put into pending
				if(!this.weaverpending) {
					this.weaverpending={};
				}
				this.weaverpending[tk.cotton]=tk.tracks;
			}
			delete tk.tracks;
		}

	} else if(tag=='geneset') {
		if(!obj.list || obj.list.length==0) {
			print2console('The gene set has no content',2);
			continue;
		}
		if(!obj.name) {
			obj.name='A gene set from datahub';
		}
		gslst.push(obj);
	} else if(tag=='geneset_ripe') {
		if(!obj.list) {
			print2console('list missing from geneset_ripe',2);
		} else {
			ibp.geneset_ripe=obj.list;
		}
	} else if(tag=='native_metadata_terms') {
		alertbox_addmsg({text:'Use of obsolete attribute "native_metadata_terms" in datahub (see '+FT2noteurl.md+')'});
	} else if(tag=='native_track') {
		// validate native tracks here and put to .tklst
		if(!obj.list) {
			print2console('Missing list in native_track',2);
		} else {
			// guard against duplicates
			for(var j=0; j<obj.list.length; j++) {
				var t=this.genome.parse_native_track(obj.list[j]);
				if(t) {
					ibp.tklst.push(t);
					ibp.track_order.push({name:t.name,where:2});
				}
			}
		}
	} else if(tag=='newbrowser') {
		ibp.newbrowserlst=obj.list;
	} else if(tag=='coordinate_override') {
		ibp.coord_rawstring=obj.coord;
	} else if(tag=='coordinate_notes') {
		if(!obj.list) {
			print2console('list missing in coordinate notes',2);
		} else {
			ibp.coord_notes=obj.list;
		}
	} else if(tag=='run_genesetview') {
		if(!obj.list) {
			print2console('list missing in genesetview',2);
		} else {
			ibp.gsvparam=obj;
		}
	} else if(tag=='splinters') {
		if(!obj.list) {
			print2console('list missing in splinters',2);
		} else {
			ibp.splinters=obj.list;
		}
	} else if(tag=='customized_color') {
		if(!obj.list) {
			print2console('list missing in '+tag,2);
		} else {
			for(var x=0; x<obj.list.length; x++) {
				var _c=obj.list[x];
				colorCentral.longlst[_c[0]]=_c[1];
			}
		}
	} else if(tag=='group_yscale_fixed') {
		if(!obj.groups) {
			print2console('groups missing in '+tag,2);
		} else {
			for(var gid in obj.groups) {
				var a=obj.groups[gid];
				if(a.min==undefined) {
					print2console('min is undefined in group '+gid,2);
				} else if(a.max==undefined) {
					print2console('max is undefined in group '+gid,2);
				} else {
					this.tkgroup[gid]={scale:scale_fix,min:a.min,min_show:a.min,max:a.max,max_show:a.max};
				}
			}
		}
	} else if(tag=='metadata') {
	} else {
		print2console('Unknown type in datahub: '+tag,2);
	}
}

if(err_tkcat1) {
	var m=err_tkcat1+' tracks are requiring category_set which is missing from the hub';
	print2console(m,2);
	alertbox_addmsg({text:m});
}
if(err_tkcat2) {
	var m=err_tkcat2+' tracks are using wrong category_set_index';
	print2console(m,2);
	alertbox_addmsg({text:m});
}

if(gslst.length>0) {
	if(!apps.gsm) {
		print2console('Error: gene set management module is not loaded',2);
	} else {
		this.genome.geneset.__pendinggs=this.genome.geneset.__pendinggs.concat(gslst);
		this.genome.addgeneset_recursive();
	}
}

// juxtaposition
// do not concern about the case when multiple tracks are tagged with juxtapose
for(var i=0; i<ibp.tklst.length; i++) {
	var t=ibp.tklst[i];
	if(t.juxtapose==undefined) continue;
	if(t.issnp) continue;
	if(t.ft==FT_bed_n||t.ft==FT_anno_n) {
		ibp.juxtapose_rawstring=t.name;
		if(ibp.juxtaposecustom) {
			delete ibp.juxtaposecustom;
		}
	} else if(t.ft==FT_bed_c||t.ft==FT_anno_c) {
		ibp.juxtapose_rawstring=t.url;
		ibp.juxtaposecustom=true;
	} else {
		print2console('Juxtaposition can only be applied to bed or annotation tracks',2);
	}
	delete t.juxtapose;
}

if(this.__golden_loadhubcb) {
	// to prevent default processing of tracks
	this.__golden_loadhubcb();
} else {
	this.ajax_loadbbjdata(ibp);
}
}




function custmdanno_parsestr(str,obj)
{
// obsolete from tabular datahub
if(str=='n/a') return false;
var s={};
var lst=str.split(',');
var err=false;
for(var i=0; i<lst.length; i++) {
	var t=lst[i].split(':');
	if(t.length!=2) {
		err=true;
		continue;
	}
	s[t[1]]=1;
}
if(!obj.md) {obj.md=[];}
obj.md[1]=s;
return err;
}



function tkdefaultMode(o)
{
/* args: 1. tk obj, 2. native mdvidx2attr
only for decors
don't die when called upon hmtks
*/
if(o.defaultmode!=undefined) {
	if(typeof(o.defaultmode=='string')) {
		return parse_tkmode(o.defaultmode);
	}
	return o.defaultmode;
}
switch(o.ft) {
case FT_bed_c:
case FT_bed_n:
case FT_anno_n:
case FT_anno_c:
	return M_full;
case FT_qdecor_n:
case FT_bigwighmtk_n:
case FT_bigwighmtk_c:
case FT_bedgraph_n:
case FT_bedgraph_c:
case FT_cat_n:
case FT_cat_c:
case FT_matplot:
case FT_catmat:
case FT_qcats:
case FT_weaver_c:
	return M_show;
case FT_lr_c:
case FT_lr_n:
	return M_arc;
case FT_sam_c:
case FT_sam_n:
case FT_bam_c:
case FT_bam_n:
	return M_den;
case FT_ld_c:
case FT_ld_n:
	return M_trihm;
case FT_cm_c:
	return M_show;
default:
	print2console('unexpected ft: '+o.ft,2);
	return M_show;
}
}

function parse_tkmode(mode)
{
if(mode==undefined) return [M_hide];
if(typeof(mode)=='string') {
	var m=decormodestr2num(mode);
	if(m==undefined) return [M_hide, 'Weird string value for track mode'];
	return [m];
}
if(typeof(mode)=='number') {
	if(mode2str[mode]) return [mode];
	return [M_hide, 'Weird numerical value for track mode'];
}
return [M_hide, 'Value of track mode neither string nor digit'];
}

function parseHubtrack(obj)
{
/* a very centralized place to parse/validate hub track attributes
works for both custom and native tracks
do not handle cmtk member tracks, they were put in init_bbj_param.tklst already
*/

// showscoreidx needs to be validated first then it can be used to validate scorenamelst, scorescalelst
for(var k1 in obj) {
	var k=k1.toLowerCase();
	var v=obj[k1];
	if(k=='showscoreidx') {
		var n=parseInt(v);
		if(isNaN(n)||n<0) {
			print2console('Invalid showscoreidx for track '+obj.name,2);
			obj.showscoreidx=0;
		} else {
			obj.showscoreidx=n;
		}
	}
}

// check the rest
var tq={}; // temp, to be appended as obj.qtc
for(var k1 in obj) {

var k=k1.toLowerCase();
var v=obj[k1];
var d=false;
var err=null;
var gray=115; // gray color to apply to any error values
var grayc='rgb('+gray+','+gray+','+gray+')';
switch(k) {
case 'color':
	// supposedly for the ruling color of query genome in weavertk, process into bedcolor
case 'boxcolor':
	if(!isNaN(colorstr2int(v)[0])) {
		tq.bedcolor=v;
	} else {
		err='wrong value';
		tq.bedcolor=grayc;
	}
	d=true;
	break;
case 'strokecolor':
	if(!isNaN(colorstr2int(v)[0])) {
		tq.strokecolor=v;
	} else {
		err='wrong value';
		tq.strokecolor=colorCentral.foreground;
	}
	d=true;
	break;
case 'textcolor':
	if(!isNaN(colorstr2int(v)[0])) {
		tq.textcolor=v;
	} else {
		err='wrong value';
		tq.textcolor=colorCentral.foreground;
	}
	d=true;
	break;
case 'colorforward':
	if(!isNaN(colorstr2int(v)[0])) {
		tq.forwardcolor=v;
	} else {
		err='wrong value';
		tq.forwardcolor=grayc;
	}
	d=true;
	break;
case 'colorreverse':
	if(!isNaN(colorstr2int(v)[0])) {
		tq.reversecolor=v;
	} else {
		err='wrong value';
		tq.reversecolor=grayc;
	}
	d=true;
	break;
case 'colormismatch':
	if(!isNaN(colorstr2int(v)[0])) {
		tq.mismatchcolor=v;
	} else {
		err='wrong value';
		tq.mismatchcolor=grayc;
	}
	d=true;
	break;
case 'colorpositive':
	// color below threshold / beyond threshold
	var t=v.split('/');
	var c=colorstr2int(t[0]);
	if(!isNaN(c[0]) && !isNaN(c[1]) && !isNaN(c[2])) {
		tq.pr=c[0];
		tq.pg=c[1];
		tq.pb=c[2];
	} else {
		err='wrong value';
		tq.pr=tq.pg=tq.pb=gray;
	}
	if(t[1]) {
		c=colorstr2int(t[1]);
		if(!isNaN(c[0]) && !isNaN(c[1]) && !isNaN(c[2])) {
			tq.pth='rgb('+c.join(',')+')';
		} else {
			tq.pth=grayc;
			err='wrong value';
		}
	} else {
		tq.pth=darkencolor(c,.3);
	}
	d=true;
	break;
case 'colornegative':
	var t=v.split('/');
	var c=colorstr2int(t[0]);
	if(!isNaN(c[0]) && !isNaN(c[1]) && !isNaN(c[2])) {
		tq.nr=c[0];
		tq.ng=c[1];
		tq.nb=c[2];
	} else {
		err='wrong value';
		tq.nr=tq.ng=tq.nb=gray;
	}
	if(t[1]) {
		c=colorstr2int(t[1]);
		if(!isNaN(c[0]) && !isNaN(c[1]) && !isNaN(c[2])) {
			tq.nth='rgb('+c.join(',')+')';
		} else {
			err='wrong value';
			tq.nth=grayc;
		}
	} else {
		tq.nth=darkencolor(c,.3);
	}
	d=true;
	break;
case 'positivefilterthreshold':
	var v2=parseFloat(v);
	if(!isNaN(v2) && v2>=0) {
		tq.pfilterscore=v2;
	} else {
		err='wrong value';
		tq.pfilterscore=0;
	}
	d=true;
	break;
case 'negativefilterthreshold':
	var v2=parseFloat(v);
	if(!isNaN(v2) && v2<=0) {
		tq.nfilterscore=v2;
	} else {
		err='wrong value';
		tq.nfilterscore=0;
	}
	d=true;
	break;
case 'height':
	var n=parseInt(v);
	if(!isNaN(n)) {
		tq.height=Math.max(10,n);
	} else {
		err='wrong value';
		tq.height=15;
	}
	d=true;
	break;
case 'summarymethod':
	var _s=v.toLowerCase();
	var _v=null;
	if(_s=='average' || _s=='mean') {
		_v=summeth_mean;
	} else if(_s=='max') {
		_v=summeth_max;
	} else if(_s=='min') {
		_v=summeth_min;
	} else if(_s=='total'||_s=='sum') {
		_v=summeth_sum;
	}
	if(_v==null) {
		err='wrong value';
		_v=summeth_mean;
	}
	tq.summeth=_v;
	d=true;
	break;
case 'fixedscale':
	/* this will alter .qtc
	but for hammock, also apply to .scorescalelst if that's not given
	*/
	if('min' in v && typeof(v.min)=='number') {
		if('max' in v && typeof(v.max)=='number') {
			tq.thtype=scale_fix;
			tq.thmin=v.min;
			tq.thmax=v.max;
		} else {
			tq.thtype=scale_auto;
			tq.min_fixed=v.min;
		}
	} else if('max' in v && typeof(v.max)=='number') {
		tq.thtype=scale_auto;
		tq.max_fixed=v.max;
	} else {
		err='wrong value';
	}
	d=true;
	break;
case 'barplot_bg':
	if(!isNaN(colorstr2int(v)[0])) {
		tq.barplotbg=v;
	} else {
		err='wrong value';
		tq.barplotbg=grayc;
	}
	d=true;
	break;
case 'backgroundcolor':
	if(!isNaN(colorstr2int(v)[0])) {
		tq.bg=v;
	} else {
		err='wrong value';
	}
	d=true;
	break;
case 'smoothwindow':
	var n=parseInt(v);
	if(isNaN(n)||n<3) {
		err='wrong value';
		tq.smooth=5;
	} else {
		if(n%2==0) n++;
		tq.smooth=n;
	}
	d=true;
	break;
case 'scorenamelst':
	if(obj.showscoreidx==undefined) {
		d=true;
		err='showscoreidx is missing';
	} else if(!Array.isArray(v)) {
		d=true;
		err='scorenamelst value should be an array of strings';
	} else if(obj.showscoreidx>=v.length) {
		d=true;
		err='scorenamelst has wrong array size';
	}
	break;
case 'scorescalelst':
	if(obj.showscoreidx==undefined) {
		d=true;
		err='showscoreidx is missing';
	} else if(!Array.isArray(v)) {
		d=true;
		err='scorescalelst value should be an array';
	} else if(obj.showscoreidx>=v.length) {
		d=true;
		err='scorescalelst has wrong array size';
	} else {
		for(var i=0; i<v.length; i++) {
			if(v[i].type!=scale_auto && v[i].type!=scale_fix) {
				err='scorescalelst item type value should be '+scale_auto+' (automatic scale) or '+scale_fix+' (fixed scale)'
				v[i].type=scale_auto;
			}
			if(v[i].type==scale_fix) {
				if(v[i].min==undefined || v[i].max==undefined) {
					err='min or max value missing from scorescalelst item';
					d=true;
					break;
				} else if(v[i].min>=v[i].max) {
					err='scorescalelst item has wrong min/max values';
				}
			}
		}
	}
	break;
case 'horizontallines':
	var lst=[];
	for(var j=0; j<v.length; j++) {
		var a=v[j];
		if('value' in a  && typeof(a.value)=='number') {
			if(!a.color) a.color=grayc;
			lst.push(a);
		} else {
			err='Incorrect value setting';
		}
	}
	if(lst.length>0) {
		obj.horizontallines=lst;
	} else {
		d=true;
	}
	break;
case 'defaultmode':
	var tmp=parse_tkmode(obj.defaultmode);
	if(tmp[1]) {
		err=tmp[1];
	}
	if(tmp[0]!=M_hide) {
		obj.defaultmode=tmp[0];
	} else {
		d=true;
	}
	break;
}
if(err) {
	var msg='Track error ('+obj.label+') : at attribute "'+k+'", '+err;
	print2console(msg,2);
	alertbox_addmsg({text:msg});
}
if(d) {
	delete obj[k1];
}
}
// done looping, attach qtc

if(!obj.qtc) {obj.qtc={};}
for(var k in tq) {
	obj.qtc[k]=tq[k];
}
if(obj.showscoreidx!=undefined) {
	if(!obj.scorenamelst) {
		alertbox_addmsg({text:'scorenamelst mising from track ('+obj.label+')'});
		delete obj.showscoreidx;
	} else if(!obj.scorescalelst) {
		// fill in, also consider "fixedscale" setting
		obj.scorescalelst=[];
		for(var i=0; i<obj.scorenamelst.length; i++) {
			if(tq.thtype==scale_fix) {
				obj.scorescalelst.push({type:scale_fix,
					min:tq.thmin,
					max:tq.thmax});
			} else {
				obj.scorescalelst.push({type:scale_auto,
					min_fixed:tq.min_fixed,
					max_fixed:tq.max_fixed});
			}
		}
	}
}
if(isNumerical(obj)) {
	if(!obj.qtc) {
		obj.qtc={};
	}
	if(obj.qtc.thtype==undefined) {
		obj.qtc.thtype=scale_auto;
	}
}
}


Browser.prototype.loaddatahub_ucsc=function(url)
{
var bbj=this;
this.cloak();
this.ajax('loaducschub=on&url='+url,function(data){bbj.loadhub_ucsc_cb(data,url);});
}
Browser.prototype.loadhub_ucsc_cb=function(data,url)
{
var hui=this.genome.custtk.ui_hub;
hui.submit_butt.disabled=false;
if(!data) {
	this.unveil();
	print2console('Failed to load this hub ('+url+')',2);
	return;
}
if(data.abort) {
	var m='Failed to load a UCSC hub: '+data.abort+'<br>('+url+')';
	print2console(m,2);
	alertbox_addmsg({text:m});
	this.ajax_loadbbjdata(this.init_bbj_param);
	return;
}
if(data.trackdbparsed) {
	if(data.acceptnum==0) {
		var m='No tracks accepted from a UCSC hub (only bigWig and BAM are allowed at the moment)<br>('+url+')';
		print2console(m,2);
		alertbox_addmsg({text:m});
		this.ajax_loadbbjdata(this.init_bbj_param);
	} else {
		// TODO make sure of tmp location t/
		var newurl= window.location.origin+window.location.pathname+'t/'+data.jsonfile;
		print2console(data.acceptnum+' tracks parsed from the UCSC hub',0);
		this.loadhub_urljson(newurl);
	}
	return;
}
if(!data.lst) {
	var m='genomesFile not found in UCSC hub ('+url+')';
	print2console(m,2);
	alertbox_addmsg({text:m});
	this.ajax_loadbbjdata(this.init_bbj_param);
	return;
}
// find the right genome
for(var i=0; i<data.lst.length; i++) {
	var a=data.lst[i];
	var gn=a[0], url2=a[1];
	if(gn==this.genome.name) {
		print2console('Loading the '+gn+' trackDb from UCSC hub...',0);
		this.loaddatahub_ucsc(url2);
		return;
	}
}
var m='No '+bbj.genome.name+' trackDb file found in the UCSC hub.';
print2console(m,2);
alertbox_addmsg({text:m});
this.ajax_loadbbjdata(this.init_bbj_param);
}



/*** __hub__ ends ***/


/*** __jump__ ***/

function jump2coord_closure(bbj,chr,start,stop)
{
return function(){
	bbj.weavertoggle(stop-start);
	bbj.cgiJump2coord(chr+' '+start+' '+stop);
};
}

Browser.prototype.jumpgene_gotlst=function(genelst)
{
if(!genelst) {
	print2console('No result.',2);
	return;
}
var total=0; // total genes
for(var i=0; i<genelst.length; i++) {
	total+=genelst[i].lst.length;
}
if(total==0) {
	print2console('No genes found.',2);
	return;
}
if(total>1) {
	var table=menu.relocate.jumplstholder;
	table.style.display='block';
	genelist2selectiontable(genelst, table, menu_lstholder_jump_closure);
	menu2_hide();
	return;
}
var g=genelst[0].lst[0];
var start=g.a, stop=g.b;
var coord=g.c+':'+start+'-'+stop;
//if(this.may_portcoord2target(coord)) return;
if(this.may_init_pending_splinter(coord)) return;
this.weavertoggle(stop-start);
if(this.jump_callback) {
	this.jump_callback(coord,g);
	return;
}
this.__pending_coord_hl=[g.c,g.a,g.b];
this.cgiJump2coord(coord);
menu_hide();
if(gflag.syncviewrange) {
	var lst=gflag.syncviewrange.lst;
	for(var i=0; i<lst.length; i++) {
		lst[i].cgiJump2coord(coord);
	}
}
}

function menu_lstholder_jump_closure(gene)
{
return function(){menu_lstholder_jump(gene);};
}
function menu_lstholder_jump(gene)
{
// choose from a list of genes and jump to it
var bbj=gflag.menu.bbj;
if(bbj.is_gsv()) {
	print2console('Cannot jump in Gene Set View mode', 2);
	return;
}
if(geneisinvalid(gene)) {
	print2console('Invalid gene data, cannot jump',2);
	return;
}
var start=gene.a, stop=gene.b;
var coord=gene.c+':'+start+'-'+stop;
//if(bbj.may_portcoord2target(coord)) return;
if(bbj.may_init_pending_splinter(coord)) return;
bbj.weavertoggle(stop-start);
if(bbj.jump_callback) {
	bbj.jump_callback(coord,gene);
	return;
}
bbj.cgiJump2coord(coord);
bbj.__pending_coord_hl=[gene.c,start,stop];
menu_hide();
if(gflag.syncviewrange) {
	var lst=gflag.syncviewrange.lst;
	for(var i=0; i<lst.length; i++) {
		lst[i].cgiJump2coord(coord);
	}
}
}

function menuJump()
{
/* called by pushing 'go' button in jump ui
*/
var bbj=gflag.menu.bbj;
if(bbj.is_gsv()) {
	print2console('Cannot jump while running Gene Set View', 2);
	return;
}
var param = menu.relocate.coord.value;
if(param.length>0) {
	var c=bbj.parseCoord_wildgoose(param,true);
	if(!c) {
		print2console('Invalid coordinate',2);
		return;
	}
	var s=c.length==3?(c[0]+':'+c[1]+'-'+c[2]):c.join(',');
	if(bbj.may_init_pending_splinter(s)) return;
	if(c.length==3) {
		bbj.weavertoggle(c[2]-c[1]);
	}
	if(bbj.jump_callback) {
		// careful here in case of moving to single base
		if(c.length==3) {
			if(c[2]-c[1]<bbj.hmSpan) {
				var m=Math.max(bbj.hmSpan/2,parseInt((c[1]+c[2])/2));
				c[1]=m-bbj.hmSpan/2;
				c[2]=m+bbj.hmSpan/2;
			}
			bbj.jump_callback(c[0]+':'+c[1]+'-'+c[2]);
			return;
		}
	}
	bbj.cgiJump2coord(s);
	if(gflag.syncviewrange) {
		var lst=gflag.syncviewrange.lst;
		for(var i=0; i<lst.length; i++) {
			lst[i].cgiJump2coord(s);
		}
	}
	return;
}
param = menu.relocate.gene.value;
if(param.length>0) {
	bbj.getcoord4genenames([param], function(dat){bbj.jumpgene_gotlst(dat);});
	return;
}
print2console("Neither gene nor coordinate given", 2);
}

Browser.prototype.cgiJump2coord=function(coord)
{
if(this.is_gsv()){
	var tmp=this.parseCoord_wildgoose(coord);
	var a,b,c;
	if(tmp.length==3) {
		a=tmp[0];
		b=tmp[1];
		c=tmp[2];
	} else {
		return;
	}
	for(var i=0; i<this.genesetview.lst.length; i++) {
		var t=this.genesetview.lst[i];
		if(t.chrom==a && Math.max(t.start,b)<Math.min(t.stop,c)) {
			this.cloak();
			this.ajaxX("itemlist=on&imgAreaSelect=on&statusId="+this.statusId+
				"&startChr="+t.name+"&startCoord="+Math.max(t.start,b)+
				"&stopChr="+t.name+"&stopCoord="+Math.min(t.stop,c)+
				(this.entire.atbplevel?'&atbplevel=on':''));
			return;
		}
	}
	return;
}
this.cloak();
this.ajaxX(this.displayedRegionParam()+"&jump=on&jumppos="+coord);
}

function menu_jump_highlighttkitem(event)
{
var bbj=gflag.menu.bbj;
if(bbj.is_gsv()) {
	print2console('Cannot jump in Gene Set View mode', 2);
	return;
}
var tr=event.target;
while(tr.tagName!='TR') tr=tr.parentNode;
if(bbj.jump_callback) {
	bbj.jump_callback(tr.coord);
	return;
}
var t=bbj.parseCoord_wildgoose(tr.coord);
if(t.length==3) bbj.__pending_coord_hl=t;
bbj.cgiJump2coord(tr.coord);
menu_hide();
}



function jumpsnp_keyup(event) { if(event.keyCode==13) menuJumpsnp(); }
function menuJumpsnp() 
{
var ss=menu.relocate.snp.value;
if(ss.length==0) {
	print2console('Please enter SNP id.',2);
	return;
}
var bbj=gflag.menu.bbj;
stripChild(menu.c47.table,0);
bbj.ajax('searchtable='+bbj.genome.snptable+'&dbName='+bbj.genome.name+'&text='+ss,
	function(data){bbj.tkitemkwsearch_cb(data);});
}




function jump_clearinput() {menu.relocate.coord.value=menu.relocate.gene.value='';}

function menuJump_keyup(event) {if(event.keyCode==13) menuJump();}

function jumpgene_keyup(event)
{
if(event.keyCode==13) {
	menuJump();
	menu2_hide();
	return;
}
if(event.keyCode==27) return;
menu.relocate.jumplstholder.style.display='none';
var ss=event.target.value;
if(ss.length<=1) {
	menu2_hide();
	return;
}
var bbj=gflag.menu.bbj;
bbj.ajax('findgenebypartialname=on&dbName='+bbj.genome.name+'&query='+ss+
	'&searchgenetknames='+bbj.genome.searchgenetknames.join(','),
	function(data){bbj.jumpgene_keyup_cb(data,ss);});
}
Browser.prototype.jumpgene_keyup_cb=function(data,query)
{
if(!data || !data.lst || data.lst.length==0) {
	menu2_hide();
	return;
}
menu2_show();
var p=absolutePosition(menu.relocate.gene);
menu2.style.left=p[0];
menu2.style.top=p[1]+20;
stripChild(menu2,0);
// returned gene names could be identical
var s={};
for(var i=0; i<data.lst.length; i++) {
	s[data.lst[i]]=1;
}
// put genes whose name start with the query to front
var lst=[];
query=query.toLowerCase();
for(var n in s) {
	var sn=n.toLowerCase();
	if(sn.indexOf(query)==0) {
		lst.push(n);
		delete s[n];
	}
}
for(n in s) lst.push(n);
for(var i=0; i<Math.min(20,lst.length); i++) {
	dom_create('div',menu2,null,{c:'menu2ele',t:lst[i],clc:menu2ele_click}).genename=lst[i];
}
}


Browser.prototype.showjumpui=function(param)
{
if(param.d) {
	menu_show_beneathdom(11, param.d);
} else {
	menu_show(11,param.x,param.y);
}
gflag.menu.bbj=this;
menu_shutup();
menu.relocate.style.display='block';
menu.relocate.jumplstholder.style.display='none';
menu.relocate.snptr.style.display= this.genome.snptable ? 'table-row' : 'none';
if(param.showchr) {
	menu.c18.style.display='none';
	if(!this.is_gsv()) {
		var t=this.getDspStat();
		if(t[0]==t[2]) {
			menu.c18.style.display='block';
			var c=menu.c18_canvas;
			c.context=1;
			var chrom=this.regionLst[0][0];
			this.genome.drawSinglechr_markInterval(c,chrom,this.dspBoundary.vstartc,this.dspBoundary.vstopc,13,2)
			c.chrom=chrom;
			c.chromlen=this.genome.scaffold.len[chrom];
			c.bpperpx=c.chromlen/c.width;
			var ctx=c.getContext('2d');
			ctx.fillStyle=colorCentral.foreground_faint_5;
			drawRuler_basepair(ctx, c.chromlen, c.width, 0, 22);
		}
	}
}
menu.relocate.div1.style.display='block';
menu.relocate.div2.style.display='none';
menu.relocate.div3.style.display='none';
// decide whether to show scfd-related options
if(this.genome.linkagegroup) {
	menu.c24.style.display='none';
	menu.c43.style.display='block';
} else {
	menu.c43.style.display='none';
	menu.c24.style.display=this.genome.scaffold.current.length>max_viewable_chrcount?'none':'block';
}
}




Browser.prototype.getcoord4genenames=function(lst,callback)
{
var bbj=this;
this.ajax('getcoord4genenames=on&scaffoldruntimenoupdate=on&dbName='+this.genome.name+
	'&lst='+lst.join(',')+'&searchgenetknames='+this.genome.searchgenetknames.join(','),
	function(data){bbj.getcoord4genenames_cb(data,callback);});
}

Browser.prototype.getcoord4genenames_cb=function(data,callback)
{
if(!data) {
	print2console('Server crashed',2);
	callback(null);
	return;
}
if(!data.result) {
	print2console('result missing from getcoord4genenames',2);
}
if(data.newscaffold) {
	this.ajax_scfdruntimesync();
}
callback(data.result);
}

/*** __jump__ ends ***/



/*** __scaffold__ ***/

Browser.prototype.ajax_scfdruntimesync=function()
{
/* big trap!!
in case of gsv, border name is itemname, but not chrom name
so adding new chrom in case of gsv need to preserve old right border!!
*/
var bbj=this;
this.ajax('scfdruntimesync=on&dbName='+this.genome.name+'&session='+this.sessionId+'&status='+this.statusId,function(data){bbj.scfdruntimesync(data)});
}

Browser.prototype.scfdruntimesync=function(data)
{
if(!data || data.error) {
	print2console('scfdruntimesync failed!',2);
	return;
}
var right=[];
if(this.is_gsv()) {
	right[0]=this.border.rname;
	right[1]=this.border.rpos;
}
for(var i=0; i<data.lst.length; i++) {
	if(!thinginlist(data.lst[i],this.genome.scaffold.current)) {
		this.genome.addnewscaffold([data.lst[i]]);
	}
}
if(this.is_gsv()) {
	// flip it back...
	this.border.rname=right[0];
	this.border.rpos=right[1];
}
}

function toggle6()
{
// inside menu, show/hide scaffold display panel
var bait1=menu.relocate.div1;
var bait2=menu.relocate.div2;
menu.relocate.jumplstholder.style.display='none'; // always hide it
if(bait1.style.display=='block') {
	bait1.style.display='none';
	bait2.style.display='block';
	menu.c18.style.display='none';
	stripChild(menu.scfd_holder,0);
	menu.scfd_holder.appendChild(gflag.menu.bbj.genome.scaffold.overview.holder);
	scfd_cancelconfigure();
	placePanel(menu);
} else {
	bait1.style.display='block';
	bait2.style.display='none';
}
}

function toggle25()
{
var bait1=menu.relocate.div1;
var bait3=menu.relocate.div3;
menu.relocate.jumplstholder.style.display='none'; // always hide it
if(bait1.style.display=='block') {
	menu.style.left=50;
	bait1.style.display='none';
	bait3.style.display='block';
	stripChild(bait3,0);
	var bbj=gflag.menu.bbj;
	bait3.appendChild(bbj.genome.linkagegroup.holder);
	placePanel(menu);
} else {
	bait1.style.display='block';
	bait3.style.display='none';
}
}


Genome.prototype.addnewscaffold=function(lst)
{
for(var i=0; i<lst.length; i++) {
	if(lst[i] in this.scaffold.len) {
		this.scaffold.current.push(lst[i])
	}
}
this.scfdoverview_makepanel();
this.scfd_cancelconfigure();
var lastone=this.scaffold.current[this.scaffold.current.length-1];
this.border.rname=lastone;
this.border.rpos=this.scaffold.len[lastone];
}

Genome.prototype.scfdoverview_makepanel=function()
{
/* make overview panel 
by the content and order of scaffold.current
if there's too many scaffolds, *do not* make this
*/
if(this.linkagegroup) {
	var o=this.linkagegroup;
	o.holder=document.createElement('table');
	o.holder.cellSpacing=o.holder.cellPadding=0;
	var d=document.createElement('div'); // to point out current location
	d.style.position='absolute';
	d.style.width=2;
	d.style.bottom=0-(o.h_top+o.h_link+o.h_bottom);
	d.style.height=o.h_bottom;
	d.style.border='solid 2px blue';
	o.shadow=d;
	var tr=o.holder.insertRow(0);
	var td=tr.insertCell(0);
	td.colSpan=2;
	td.align='center';
	td.style.paddingBottom=10;
	td.style.color=colorCentral.foreground_faint_5;
	td.innerHTML=o.totalnum+' scaffold sequences (bars '+
		'<span title="forward strand" style="color:white;background-color:'+o.c_for+';">&nbsp;&gt;&nbsp;</span> '+
		'<span title="reverse strand" style="color:white;background-color:'+o.c_rev+';">&nbsp;&lt;&nbsp;</span> '+
		'<span title="unknown strand" style="color:white;background-color:'+o.c_un+';">&nbsp;?&nbsp;</span> ) '+
		'are mapped on the linkage groups.'+
		'<br>'+
		'To display in browser: click on a scaffold, or drag and select multiple scaffolds';

	// longest group
	var m=0;
	for(var n in o.len) {
		var x=o.len[n];
		if(x>m) m=x;
	}
	var sf=o.maxw/m;
	o.sf=sf;
	var lg2holder={}; // lnkgrp name 2 div
	var lg2piecewidth={}; // px width of a seq bar
	// render
	var h_barplot=50;
	for(var i=0; i<o.order.length; i++) {
		var lgname=o.order[i];
		var lst=o.hash[lgname]; // all scfd in this group
		// get max bp length to make barplot
		var maxbp=0;
		for(var j=0; j<lst.length; j++) {
			var s=this.scaffold.len[lst[j].n];
			if(maxbp<s) maxbp=s;
		}
		var plotwidth=Math.ceil(o.len[lgname]*sf); // graph px width
		var seqwidth=plotwidth/lst.length;
		lg2piecewidth[lgname]=seqwidth;
		// 1-1
		var tr=o.holder.insertRow(-1);
		var td=tr.insertCell(0);
		td.align='right';
		td.style.paddingRight=10;
		var header=dom_create('canvas',td);
		header.height=h_barplot;
		header.width=100;
		plot_ruler({ctx:header.getContext('2d'),color:'black',start:h_barplot-.5,stop:0,horizontal:false,min:0,max:maxbp,xoffset:99,extremeonly:true});
		// 1-2
		td=tr.insertCell(1);
		var d=dom_create('div',td,'position:relative');
		lg2holder[lgname]=d;
		d.addEventListener('mousedown',lnkgrp_div_md,false);
		d.lgname=lgname;
		for(j=0; j<lst.length; j++) {
			var s=lst[j];
			// cannot use canvas for ele
			var ele=dom_create('div',d,'width:'+seqwidth+'px;height:'+h_barplot+'px;');
			ele.className='lnkgrp_box';
			ele.n=s.n;
			ele.cM=s.d;
			var bar=dom_create('div',ele);
			// fill bar
			bar.style.height=h_barplot*this.scaffold.len[s.n]/maxbp;
			if(s.s=='+') {
				bar.style.backgroundColor=o.c_for;
				ele.strand='forward';
			} else if(s.s=='-') {
				bar.style.backgroundColor= o.c_rev;
				ele.strand='reverse';
			} else {
				bar.style.backgroundColor= o.c_un;
				ele.strand='';
			}
			ele.addEventListener('mouseover',lnkgrp_seq_mo,false);
			ele.addEventListener('mouseout',pica_hide,false);
			ele.addEventListener('click',lnkgrp_seq_click,false);
		}
		// 2-1
		tr=o.holder.insertRow(-1);
		td=tr.insertCell(0);
		td.style.paddingRight=20;
		td.align='right';
		//td.vAlign='bottom';
		td.style.paddingBottom='10px';
		td.innerHTML=lgname;
		// 2-2
		td=tr.insertCell(1);
		td.style.paddingBottom='10px';
		var canvas=dom_create('canvas',td,'border-bottom:solid 3px '+colorCentral.foreground_faint_3);
		canvas.width=plotwidth;
		canvas.height=o.h_top+o.h_link+o.h_bottom;
		var ctx=canvas.getContext('2d');
		for(var j=0; j<lst.length; j++) {
			var s=lst[j];
			if(s.s=='+') {
				ctx.strokeStyle=o.c_for;
			} else if(s.s=='-') {
				ctx.strokeStyle= o.c_rev;
			} else {
				ctx.strokeStyle= o.c_un;
			}
			ctx.beginPath();
			var x=parseInt(seqwidth*(j+0.5))+0.5;
			ctx.moveTo(x,0);
			ctx.lineTo(x,o.h_top);
			x=parseInt(s.d*sf)+0.5;
			ctx.lineTo(x,o.h_top+o.h_link);
			ctx.lineTo(x,o.h_top+o.h_link+o.h_bottom);
			ctx.stroke();
		}
	}
	o.lg2holder=lg2holder;
	o.lg2piecewidth=lg2piecewidth;
	return;
}
if(this.scaffold.current.length>max_viewable_chrcount) { return; }
var maxlen=0;
for(var i=0; i<this.scaffold.current.length; i++) {
	var c=this.scaffold.current[i];
	maxlen=Math.max(maxlen, this.scaffold.len[c]);
}
var table=this.scaffold.overview.holder;
if(table.firstChild) {
	stripChild(table.firstChild,0);
}
this.scaffold.overview.trlst=[];
var sf=maxlen/this.scaffold.overview.maxw;
for(i=0; i<this.scaffold.current.length; i++) {
	var chr=this.scaffold.current[i];
	var w=Math.ceil(this.scaffold.len[chr]/sf);
	var tr=this.scaffold.overview.holder.insertRow(-1);
	tr.style.backgroundColor='transparent';
	tr.chr=chr;
	var td=tr.insertCell(0);
	td.style.width=100;
	td.align='right';
	td.innerHTML='<div style="color:#b3b3b3;font-size:12px;">'+chr+'</div>'+
		'<div class=header_b style="margin-right:5px" onmousedown="scfd_movebutt_md(event)">'+chr+'</div>'+
		'<span class=header_r onclick="scfd_hidebutt_click(event)">&#10005;</span>';
	var c=document.createElement('canvas');
	c.chr=chr;
	c.width=w+1;
	c.height=this.scaffold.overview.barheight+1;
	c.className='opaque5';
	c.addEventListener('mousemove', scfdoverview_Hmove, false);
	c.addEventListener('mouseout', pica_hide, false);
	c.addEventListener('mousedown', scfdoverview_zoomin_Md, false);
	drawIdeogramSegment_simple(
		this.getcytoband4region2plot(chr, 0, this.scaffold.len[chr], w),
		c.getContext('2d'), 0, 0, w, ideoHeight, false);
	td=tr.insertCell(-1);
	td.appendChild(c);
	this.scaffold.overview.pwidth[c]=w;
	this.scaffold.overview.trlst.push(tr);
}
this.scaffold.overview.sf=sf;
// last row for items not in .current and can be added
var addlst=[];
for(var n in this.scaffold.len) {
	if(!thinginlist(n, this.scaffold.current)) addlst.push(n);
}
if(addlst.length>0) {
	var tr=table.insertRow(-1);
	var td=tr.insertCell(0);
	td.colSpan=2;
	div=document.createElement('div');
	div.innerHTML=addlst.length+' additional items available';
	div.style.fontSize='12px';
	div.style.padding=4;
	div.addEventListener('click', toggle2, false);
	td.appendChild(div);
	div=document.createElement('div');
	div.style.display='none';
	td.appendChild(div);
	var d2=document.createElement('div');
	d2.style.width=100+this.scaffold.overview.maxw;
	div.appendChild(d2);
	for(i=0; i<addlst.length; i++) {
		var ent=document.createElement('span');
		ent.className='header_g';
		ent.style.display='inline-block';
		ent.style.margin=2;
		ent.innerHTML=addlst[i];
		ent.chr=addlst[i];
		ent.addEventListener('click', scfd_toadd_entryclick, false);
		d2.appendChild(ent);
	}
	this.scaffold.overview.newtr=tr;
}
/* over */
}

function scfd_toadd_entryclick(event) {
// click an entry and add it to overview table, pending for submission
	var lst=gflag.menu.bbj.genome.scaffold.toadd;
	if(event.target.className=='header_g') {
		lst.push(event.target.chr);
		event.target.className='header_b';
	} else {
		for(var i=0; i<lst.length; i++) {
			if(lst[i]==event.target.chr) {
				lst.splice(i,1);break;
			}
		}
		event.target.className='header_g';
	}
}

function scfdoverview_Hmove(event)
{
var genome=gflag.menu.bbj.genome;
var pos=absolutePosition(event.target);
picasays.innerHTML=event.target.chr+', '+parseInt((event.clientX+document.body.scrollLeft-pos[0])*genome.scaffold.overview.sf);
pica_go(event.clientX-document.body.scrollLeft,pos[1]+event.target.clientHeight-document.body.scrollTop);
}
function scfdoverview_zoomin_Md(event)
{
// press down
if(event.button != 0) return; // only process left click
event.preventDefault();
var pos = absolutePosition(event.target);
indicator.style.display = "block";
indicator.style.left = event.clientX + document.body.scrollLeft;
indicator.style.top = pos[1];
indicator.style.width = 0;
indicator.style.height = event.target.clientHeight;
gflag.navigator={
	bbj:gflag.menu.bbj,
	x:event.clientX+document.body.scrollLeft,
	xcurb:pos[0],
	chr:event.target.chr,
	canvas:event.target,
	};
document.body.addEventListener("mousemove", scfdoverview_zoomin_Mm, false);
document.body.addEventListener("mouseup", scfdoverview_zoomin_Mu, false);
}
function scfdoverview_zoomin_Mm(event)
{
var currx = event.clientX + document.body.scrollLeft;
var n=gflag.navigator;
if(currx > n.x) {
	if(currx < n.xcurb+n.canvas.width) {
		indicator.style.width = currx - n.x;
	}
} else {
	if(currx >= n.xcurb) {
		indicator.style.width = n.x - currx;
		indicator.style.left = currx;
	}
}
}
function scfdoverview_zoomin_Mu(event)
{
document.body.removeEventListener("mousemove", scfdoverview_zoomin_Mm, false);
document.body.removeEventListener("mouseup", scfdoverview_zoomin_Mu, false);
indicator.style.display = "none";
var n=gflag.navigator;
var x = parseInt(indicator.style.left)-n.xcurb; // relative to minichr canvas div
var w = parseInt(indicator.style.width);
if(w==0) {
	w=1;
}
var coord1=parseInt(n.bbj.genome.scaffold.overview.sf*x);
var coord2=coord1+parseInt(n.bbj.genome.scaffold.overview.sf*w);
if(coord1>n.bbj.genome.scaffold.len[n.chr]) return;
coord2=Math.max(coord2, coord1+n.bbj.hmSpan/MAXbpwidth_bold);
if(coord2>n.bbj.genome.scaffold.len[n.chr]) return;
menu_hide();
var coord=n.chr+':'+coord1+'-'+coord2;
if(n.bbj.may_init_pending_splinter(coord)) return;
if(n.bbj.jump_callback) {
	n.bbj.jump_callback(coord);
	return;
}
n.bbj.weavertoggle(coord2-coord1);
n.bbj.cgiJump2coord(coord);
if(gflag.syncviewrange) {
	var lst=gflag.syncviewrange.lst;
	for(var i=0; i<lst.length; i++) {
		lst[i].cgiJump2coord(coord);
	}
}
}

function scfd_invokeconfigure() {
// invoke scaffold configure UI
	if(gflag.menu.bbj.juxtaposition.type!=RM_genome) {
		print2console('Customizing scaffold sequences is only possible under genome mode, please quit juxtaposition/GeneSetView first.',2);
		return;
	}
	menu.relocate.scfd_foo.style.display='none';
	menu.relocate.scfd_bar.style.display='block';
	var ov=gflag.menu.bbj.genome.scaffold.overview;
	for(var i=0; i<ov.holder.firstChild.childNodes.length; i++) {
		// rows containing chromosome canvas contain two cell
		// need to escape ov.newtr which contain 1 cell
		var tr=ov.holder.firstChild.childNodes[i];
		if(tr.childNodes.length==2) {
			var lst=tr.firstChild.childNodes;
			lst[0].style.display='none';
			lst[1].style.display=lst[2].style.display='inline';
		}
	}
	if(ov.newtr) {
		ov.newtr.style.display='table-row';
		ov.newtr.firstChild.firstChild.style.display='block';
		ov.newtr.firstChild.childNodes[1].style.display='none';
	}
}
function scfd_cancelconfigure() {
// called by pushing button
	gflag.menu.bbj.genome.scfd_cancelconfigure();
}

Genome.prototype.scfd_cancelconfigure=function()
{
// cancel scaffold configure UI and reset everything
menu.relocate.scfd_foo.style.display='block';
menu.relocate.scfd_bar.style.display='none';
var ov=gflag.menu.bbj.genome.scaffold.overview;
var tbody=ov.holder.firstChild;
for(var i=0; i<ov.trlst.length; i++) {
	var tr=ov.trlst[i];
	tr.style.backgroundColor='transparent';
	tbody.appendChild(tr);
	var lst=tr.firstChild.childNodes;
	lst[0].style.display='block';
	lst[1].style.display=lst[2].style.display='none';
}
if(ov.newtr) {
	tbody.appendChild(ov.newtr);
	ov.newtr.style.display='none';
}
}
function scfd_movebutt_md(event) {
// must not use scaffold.current to determine idx
	event.preventDefault();
	var chr=event.target.parentNode.parentNode.chr;
	var lst=gflag.menu.bbj.genome.scaffold.overview.holder.firstChild.childNodes;
	for(var i=0; i<lst.length; i++) {
		if(lst[i].chr==chr) break;
	}
	event.target.className='header_g';
	gflag.menu.bbj.genome.scaffold.move={
		target:event.target,
		idx:i,
		total:lst.length,
		y:event.clientY};
	document.body.addEventListener('mousemove',scfd_movebutt_mm, false);
	document.body.addEventListener('mouseup',scfd_movebutt_mu, false);
}
function scfd_movebutt_mm(event) {
	var m=gflag.menu.bbj.genome.scaffold.move;
	var tbody=gflag.menu.bbj.genome.scaffold.overview.holder.firstChild;
	if(event.clientY<m.y) {
		if(m.idx==0) return;
		if(m.y-event.clientY>=20) {
			tbody.appendChild(tbody.childNodes[m.idx]);
			var lst=[];
			for(var i=m.idx-1; i<m.total-1; i++) lst.push(tbody.childNodes[i]);
			for(var i=0; i<lst.length; i++) tbody.appendChild(lst[i]);
			m.idx--;
			m.y=event.clientY;
		}
	} else if(event.clientY>m.y) {
		if(m.idx==m.total-1) return;
		if(event.clientY-m.y>=20) {
			tbody.appendChild(tbody.childNodes[m.idx+1]);
			var lst=[];
			for(var i=m.idx; i<m.total-1; i++) lst.push(tbody.childNodes[i]);
			for(var i=0; i<lst.length; i++) tbody.appendChild(lst[i]);
			m.idx++;
			m.y=event.clientY;
		}
	}
}
function scfd_movebutt_mu(event) {
	document.body.removeEventListener('mousemove',scfd_movebutt_mm, false);
	document.body.removeEventListener('mouseup',scfd_movebutt_mu, false);
	gflag.menu.bbj.genome.scaffold.move.target.className='header_b';
}
function scfd_hidebutt_click(event) {
	var tr=event.target.parentNode.parentNode;
	tr.style.backgroundColor=tr.style.backgroundColor=='transparent'?'#858585':'transparent';
}
function scfd_updateconfigure()
{
	var newlst=[];
	var bbj=gflag.menu.bbj;
	var trlst=bbj.genome.scaffold.overview.holder.firstChild.childNodes;
	for(var i=0; i<trlst.length; i++) {
		if(trlst[i].style.backgroundColor=='transparent')
			newlst.push(trlst[i].chr);
	}
	newlst=newlst.concat(bbj.genome.scaffold.toadd);
	bbj.genome.scaffold.toadd=[];
	if(stringLstIsIdentical(newlst, bbj.genome.scaffold.current)) {
		scfd_cancelconfigure();
		return;
	}
	// now determine dsp
	var dspParam = '';
	if(bbj.dspBoundary.vstartr==bbj.dspBoundary.vstopr && thinginlist(bbj.regionLst[bbj.dspBoundary.vstartr][0], newlst)) {
		// very well, currently only showing single region and that region is still in use
		dspParam = '&'+bbj.displayedRegionParam();
	} else {
		var preservedRegions = [];
		var oldlookregion = [];
		for(i=bbj.dspBoundary.vstartr; i<=bbj.dspBoundary.vstopr; i++)
			oldlookregion.push(bbj.regionLst[i][0]);
		for(i=0; i<newlst.length; i++) {
			if(thinginlist(newlst[i], oldlookregion))
				preservedRegions.push(newlst[i]);
		}
		var dspSeq = null;
		if(preservedRegions.length > 0) {
			dspSeq = preservedRegions[0];
		} else {
			dspSeq = newlst[0];
		}
		// just use first sequence but need to make sure not to display too long region
		var totalLength = 0;
		for(i=0; i<newlst.length; i++)
			totalLength += bbj.genome.scaffold.len[newlst[i]];
		var allowed = parseInt(totalLength/3);
		if(allowed <= 80) {
			print2console("Sorry cannot carry out this operation, please try again by including more scaffold sequences", 2);
			return;
		}
		allowed = allowed>bbj.genome.scaffold.len[dspSeq] ? bbj.genome.scaffold.len[dspSeq] : allowed;
		dspParam = '&runmode='+RM_genome+'&startChr='+dspSeq+'&startCoord=0&stopChr='+dspSeq+'&stopCoord='+(allowed>10000?10000:allowed);
	}
	bbj.genome.scaffold.current=newlst;
	bbj.genome.scfdoverview_makepanel();
	scfd_cancelconfigure();
	// make some new param strings
	var tmp = [];
	for(i=0; i<newlst.length; i++) {
		tmp.push(newlst[i]);
		tmp.push(bbj.genome.scaffold.len[newlst[i]]);
	}
	bbj.ajaxX('scaffoldUpdate=on&scaffoldNames='+tmp.join(',')+',&scaffoldCount='+newlst.length+dspParam);
}

function lnkgrp_seq_mo(event)
{
// from inside menu, mouse over a seq item
var bbj=gflag.menu.bbj;
var dom=event.target;
if(!dom.className) {
	dom=dom.parentNode;
}
var n=dom.n; // this seq name
picasays.innerHTML='<b>'+n+'</b> '+bbj.genome.scaffold.len[n]+' bp, '+dom.strand+'<br>Distance: '+dom.cM+' cM';
pica_go(event.clientX,event.clientY);
// highlight this seq on linkage map
var o=bbj.genome.linkagegroup;
o.lg2holder[bbj.genome.scaffold.tolnkgrp[n]].appendChild(o.shadow);
o.shadow.style.left=o.sf*dom.cM-2;
}

function lnkgrp_seq_click(event)
{
var bbj=gflag.menu.bbj;
var dom=event.target;
if(!dom.className) {
	dom=dom.parentNode;
}
var n=dom.n;
bbj.cgiJump2coord(n+':0-'+bbj.genome.scaffold.len[n]);
menu_hide();
}

function lnkgrp_div_md(event)
{
// drag on linkage group bar and select a bunch of seq to show
if(event.button!=0) return;
event.preventDefault();
var dom=event.target;
while(!dom.lgname) {
	dom=dom.parentNode;
}
var bbj=gflag.menu.bbj;
var pos = absolutePosition(dom);
indicator.style.left = event.clientX + document.body.scrollLeft;
indicator.style.top = pos[1];
indicator.style.width = 1;
indicator.style.height = dom.clientHeight;
gflag.c18={
	domwidth:dom.clientWidth,
	x:event.clientX+document.body.scrollLeft,
	lgname:dom.lgname,
	xcurb:pos[0]};
document.body.addEventListener('mousemove',lnkgrp_div_mm,false);
document.body.addEventListener('mouseup',lnkgrp_div_mu,false);
}
function lnkgrp_div_mm(event)
{
var currx = event.clientX + document.body.scrollLeft;
var n=gflag.c18;
indicator.style.display='block';
if(currx > n.x) {
	if(currx < n.xcurb+n.domwidth) {
		indicator.style.width = currx - n.x;
	}
} else {
	if(currx >= n.xcurb) {
		indicator.style.width = n.x - currx;
		indicator.style.left = currx;
	}
}
}
function lnkgrp_div_mu(event)
{
document.body.removeEventListener('mousemove',lnkgrp_div_mm,false);
document.body.removeEventListener('mouseup',lnkgrp_div_mu,false);
indicator.style.display='none';
var n=gflag.c18;
var x=parseInt(indicator.style.left)-n.xcurb;
var w=parseInt(indicator.style.width);
var bbj=gflag.menu.bbj;
var i=parseInt(x/bbj.genome.linkagegroup.lg2piecewidth[n.lgname]);
var j=parseInt((x+w)/bbj.genome.linkagegroup.lg2piecewidth[n.lgname]);
var lst=bbj.genome.linkagegroup.hash[n.lgname];
if(i<lst.length && j<lst.length) {
	menu_hide();
	gflag.menu.bbj.cloak();
	gflag.menu.bbj.ajaxX(gflag.menu.bbj.runmode_param()+'&jump=on&jumppos2='+
	lst[i].n+',0,'+lst[j].n+','+
	gflag.menu.bbj.genome.scaffold.len[lst[j].n]);
}
}

/*** __scaffold__ ends ***/



/*** __spread__ spreading info from genome to all browser objects  ***/

Genome.prototype.spread_custmdterm=function(termname)
{
/* skip splinters */
for(var n in horcrux) {
	var bbj=horcrux[n];
	if(bbj.splinterTag!=null) continue;
	if(bbj.genome.name!=this.name) continue;
	var opt = document.createElement('option');
	opt.value = termname;
	opt.innerHTML = termname;
	bbj.cfacet.md1.add(opt);
	opt = document.createElement('option');
	opt.value = termname;
	opt.innerHTML = termname;
	bbj.cfacet.md2.add(opt);
	apps.custtk.bbj=bbj;
	simulateEvent(bbj.cfacet.md1,'change');
}
}

/*** __spread__ ends ***/







/*** __splinter__  ***/

Browser.prototype.splinter_issuetrigger=function(coord)
{
// triggered by app, show empty splinter holder with prompt of choosing view range
var bbj= this.splinterTag ? this.trunk : this;
if(bbj.weaver) {
	print2console('This function is not available for the moment!',2);
	return;
}
var pa={splinters:[coord]};
bbj.init_bbj_param=pa;
bbj.ajax_loadbbjdata(pa);
}

Browser.prototype.splinter_recursive=function(callback)
{
if(!this.splinter_pending) return;
if(this.splinter_pending.length==0) {
	delete this.splinter_pending;
	return;
}
this.splinter_make(this.splinter_pending.splice(0,1)[0],callback);
}

Browser.prototype.splinter_make=function(arg,callback)
{
/* called from a trunk
*/
if(this.splinterTag) {
	print2console('splinter: not called from a trunk',2);
	return;
}
var holder=this.splinterHolder.firstChild.firstChild.insertCell(-1);
holder.style.width= holder.__splinter_width=arg.width;
holder.vAlign='top';
var chip=new Browser();
chip.trunk=this;
// TODO
if(this.weaver) {
	chip.weaver={q:{},insert:[]};
}
chip.hmSpan=arg.width;
var tag=Math.random().toString();
chip.splinterTag=tag;
chip.leftColumnWidth=0;
chip.browser_makeDoms({
	mainstyle:'border:1px solid '+colorCentral.magenta7+';background-color:'+colorCentral.background_faint_7+';margin:0px 2px;',
	centralholder:holder,
	header:{
		height:browser_scalebar_height-1,
		padding:'0px',
		fontsize:'12px',
		zoomout:[[2,2]],
		dspstat:{allowupdate:true,tinyfont:'80%'},
		utils:{bbjconfig:true,
			'delete':function(){chip.splinter_delete();}},
		},
	ghm_ruler:true,
	hmdivbg:'white'
	}
);
chip.ideogram.canvas.oncontextmenu=menu_coordnote;
chip.genome=this.genome;
chip.runmode_set2default();
/* set following to null to disable corresponding actions */
chip.facet=
chip.cfacet=null;
chip.applyHmspan2holders();
chip.notes=this.notes;
if(callback) {
	chip.onloadend_once=callback;
}
if(arg.coord) {
	this.splinters[tag]=chip;
	var pa={mustaddcusttk:true,coord_rawstring:arg.coord};
	this.bbjparamfillto_tk(pa);
	chip.init_bbj_param=pa;
	chip.ajax_loadbbjdata(pa);
	return;
}
// no coord, ask
loading_done();
chip.__pending_splinter=true;
chip.main.style.display='none';
var d0=dom_create('div',holder,'border:10px solid transparent;');
var d=make_headertable(d0);
d.style.display='none';
d.style.backgroundColor=colorCentral.magenta1;
d._h.innerHTML='New panel will appear here';
var h=this.tkpanelheight();
if(h>160) {
	d.style.height=h;
}
d._c.style.textAlign='center';
dom_addbutt(d._c,'SELECT VIEW RANGE',function(e){chip.showjumpui({d:e.target});});
dom_create('br',d._c);
dom_create('br',d._c);
dom_addbutt(d._c,'Cancel',function(e){chip.splinter_abort()});
panelFadein(d);
}

Browser.prototype.may_init_pending_splinter=function(coord)
{
// only for app-created splinters
if(!this.__pending_splinter) return false;
delete this.__pending_splinter;
if(!this.splinterTag) fatalError('may_init_pending_splinter: splinterTag missing');
this.main.style.display='block';
this.main.parentNode.removeChild(this.main.nextSibling.nextSibling);
var pa={mustaddcusttk:true,coord_rawstring:coord};
this.trunk.bbjparamfillto_tk(pa);
this.init_bbj_param=pa;
this.trunk.splinters[this.splinterTag]=this;
this.ajax_loadbbjdata(pa);
return true;
}

Browser.prototype.splinter_abort=function()
{
this.trunk.sethmspan_refresh( this.trunk.hmSpan+this.hmSpan);
delete horcrux[this.horcrux];
var h=this.main.parentNode;
h.parentNode.removeChild(h);
}



function splinter_pushbutt(event)
{
var bbj=event.target.bbj;
var c=bbj.genome.parseCoordinate(event.target.coord,2);
if(!c) {
	print2console('Invalid coordinate for adding secondary panel',2);
	return;
}
bbj.splinter_pending=[{coord:[c[0],c[1],c[3]],width:400}];
bbj.splinter();
}


function splinter_zoomout(tag)
{
// arg is splinter tag
var b=gflag.browser.splinterTag==tag?gflag.browser:gflag.browser.splinters[tag];
b.cgiZoomout(1,false);
}
function splinter_zoomin(tag)
{
var b=gflag.browser.splinterTag==tag?gflag.browser:gflag.browser.splinters[tag];
b.cgiZoomin(2);
}
function splinter_pan(tag, direction)
{
var b=gflag.browser.splinterTag==tag?gflag.browser:gflag.browser.splinters[tag];
b.arrowPan(direction,1);
}
Browser.prototype.splinter_delete=function()
{
delete this.trunk.splinters[this.splinterTag];
this.splinter_abort();
}


/*** __splinter__ ends ***/




/*** __svg__ ***/
function svgpanelhide()
{
pagecloak.style.display='none';
panelFadeout(apps.svg.main);
}
function svgpanelshow()
{
// called from menu option
cloakPage();
panelFadein(apps.svg.main,100+document.body.scrollLeft,100+document.body.scrollTop);
apps.svg.bbj=gflag.menu.bbj;
apps.svg.urlspan.innerHTML='';
menu_hide();
}

function svgColor(type,colorstr)
{
var color=colorstr.toLowerCase();
if(color.substr(0,4)=='rgba') {
	var t=color.split(/[\(\)]/)[1].split(',');
	if(t.length==3) {
		return type+':rgb('+t.join(',')+');';
	}
	if(t.length==4) {
		return type+':rgb('+t[0]+','+t[1]+','+t[2]+');'+type+'-opacity:'+t[3]+';';
	}
	return type+':black;';
}
return type+':'+colorstr+';';
}

Browser.prototype.svgadd=function(e)
{
/* note: range limit for scrollables [0, hmSpan]
but not this one!! [X, hmSpan+x]
*/
var L=this.move.styleLeft,
	X=this.svg.gx,
	Y=this.svg.gy;
switch(e.type) {
case svgt_no: 
	return;
case svgt_line:
case svgt_line_notscrollable:
	var M=e.type==svgt_line;
	if(M) {
		if(e.x1+L>this.hmSpan || e.x2+L<0) return;
		e.x1=Math.max(0-L,e.x1);
		e.x2=Math.min(this.hmSpan-L,e.x2);
	}
	this.svg.content.push('<line '+
		'x1="'+(X+e.x1+(M?L:0))+'" y1="'+(Y+e.y1)+'" x2="'+(X+e.x2+(M?L:0))+'" y2="'+(Y+e.y2)+'" style="'+
		svgColor('stroke',e.color?e.color:colorCentral.foreground)+
		(e.w?'stroke-width:'+e.w+';':'')+'"/>');
	return;
case svgt_text:
case svgt_text_notscrollable:
	var M=e.type==svgt_text;
	var x=e.x+L;
	if(M) {
		if(e.x+L<0 || e.x+L>this.hmSpan) return;
	}
	this.svg.content.push('<text font-family="arial" '+
		'x="'+(X+e.x+(M?L:0))+'" y="'+(Y+e.y)+'" '+
		(e.transform?'transform="'+e.transform+'" ':'')+
		'style="'+
		'font-size:'+(e.size?e.size:'8pt')+';'+
		svgColor('fill',e.color?e.color:colorCentral.foreground)+
		(e.bold?'font-weight:bold;':'')+
		'">'+e.text+'</text>');
	return;
case svgt_rect:
case svgt_rect_notscrollable:
	var M=e.type==svgt_rect;
	if(M) {
		if(e.x+e.w+L<0) return;
		if(e.x+L>this.hmSpan) return;
		if(e.x+L<0) {
			e.w+=e.x+L;
			e.x=0-L;
		}
		if(e.x+e.w+L>this.hmSpan) {
			e.w-=e.x+e.w+L-this.hmSpan;
		}
	}
	this.svg.content.push('<rect x="'+(X+e.x+(M?L:0))+'" y="'+(Y+e.y)+'" '+
		'width="'+e.w+'" height="'+e.h+'" style="'+
		svgColor('fill',e.fill?e.fill:'none')+
		(e.stroke?svgColor('stroke',e.stroke):'')+
		'"/>');
	return;
case svgt_arc:
	if(e.x1+L>this.hmSpan) return;
	if(e.x2+L<0) return;
	if(e.x1+L<0) {
		// need to compute new x1/y1
		return;
	}
	if(e.x2+L>this.hmSpan) {
		// need to compute new x2/y2
		return;
	}
	this.svg.content.push('<path d="M'+(X+e.x1+L)+' '+(Y+e.y1)+
		' A '+e.radius+' '+e.radius+' 1 0 0 '+(X+e.x2+L)+' '+(Y+e.y2)+'"'+
		' style="fill: none; '+svgColor('stroke',e.color)+' stroke-width:1;"/>');
	return;
case svgt_trihm:
	/*       p3
		 p4      p2
			 p1
	*/
	if(e.x4+L>this.hmSpan) return;
	if(e.x2+L<0) return;
	if(e.x4+L<0) {
		// need to compute new x4/y4
		return;
	}
	if(e.x2+L>this.hmSpan) {
		// need to compute new x2/y2
		return;
	}
	this.svg.content.push('<path d="M'+(X+e.x1+L)+' '+(Y+Math.max(0,e.y1))+
	' L'+(X+e.x2+L)+' '+(Y+Math.max(0,e.y2))+
	' L'+(X+e.x3+L)+' '+(Y+Math.max(0,e.y3))+
	' L'+(X+e.x4+L)+' '+(Y+Math.max(0,e.y4))+
	' Z" '+
	'style="'+svgColor('fill',e.color)+'"/>');
	break;
case svgt_polygon:
	var lst=[];
	for(var i=0; i<e.points.length; i++) {
		var p=e.points[i];
		lst.push((X+p[0]+L)+','+(Y+p[1]));
	}
	this.svg.content.push('<polygon points="'+lst.join(' ')+'" style="'+
		svgColor('fill',e.fill)+
		'"/>');
	return;
default: fatalError('unknown svg tag type '+e.type);
}
}


function makesvg_browserpanel_pushbutt(event)
{
/* called by pushing "generate graph" buttons
called with trunk browser, but not splinter
*/
event.target.disabled=true;
apps.svg.urlspan.innerHTML='working...';

var showtklabel=apps.svg.showtklabel.checked;

/* dimension of entire graph
for safety reason, tk label height is included for all tracks to estimate height
*/
var bbj=apps.svg.bbj;
var viewabletkcount=0;
for(var i=0; i<bbj.tklst.length; i++) {
	if(!tkishidden(bbj.tklst[i])) viewabletkcount++;
}
var gwidth=bbj.hmSpan+
	(showtklabel?bbj.leftColumnWidth:0)+
	(tkAttrColumnWidth)*bbj.mcm.lst.length;
for(var k in bbj.splinters) {
	gwidth+=bbj.splinters[k].hmSpan;
}
var gheight=bbj.main.clientHeight+1*viewabletkcount;
for(var k in bbj.splinters) {
	var s=bbj.splinters[k];
	gheight=Math.max(gheight,s.main.clientHeight+1*viewabletkcount);
}

/* graph size is now determined */

var content=['<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="'+gwidth+'" height="'+gheight+'">'];

/* draw splinters first!
trunk will put blankets later
*/
var offset=bbj.hmSpan+(showtklabel?bbj.leftColumnWidth:0)+2;
for(var k in bbj.splinters) {
	var s=bbj.splinters[k];
	var h=s.makesvg_specific({gx:offset,showtklabel:false});
	// border around splinter
	h+=2; // h is inaccurate..
	s.svg.gy=0;
	s.svgadd({type:svgt_rect_notscrollable,x:-1,y:0,w:s.hmSpan,h:h,stroke:colorCentral.foreground_faint_3});
	content=content.concat(s.svg.content);
	delete s.svg;
	offset+=s.hmSpan+3;
}
bbj.makesvg_specific({gx:0,showtklabel:showtklabel,svgheight:gheight});
content=content.concat(bbj.svg.content);
delete bbj.svg;
content.push('</svg>');
ajaxPost('svg\n'+content.join(''),function(text){svgshowlink(text);});
}
function svgshowlink(key)
{
apps.svg.submitbutt.disabled=false;
if(!key) {
	print2console('Sorry please try again.',2);
	return;
}
apps.svg.urlspan.innerHTML='<a href=t/'+key+' target=_blank>Link to the svg file</a>';
}


Browser.prototype.makesvg_specific=function(param)
{
/* to be called on a browser object, either trunk or splinter
*/
this.svg={
	// global offset
	gx:param.gx,
	gy:(param.gy?param.gy:0),
	content:[],
	};
if(param.showtklabel) {
	this.svg.gx+=this.leftColumnWidth;
}
if(this.rulercanvas) {
	var data=this.drawRuler_browser(true);
	for(var i=0; i<data.length; i++) {
		data[i].color=colorCentral.foreground;
		this.svgadd(data[i]);
	}
	this.svg.gy+=this.rulercanvas.height;
}

/* all the tracks
*/
var oldgy=this.svg.gy;
for(var i=0; i<this.tklst.length; i++) {
	var tk=this.tklst[i];
	if(tkishidden(tk)) continue;
	var tkh=tk_height(tk)+parseInt(tk.canvas.style.paddingBottom);
	var oldy=this.svg.gy;
	if(tk.where==2) this.svg.gy+=this.ideogram.canvas.height;
	// line on top
	this.svgadd({type:svgt_line_notscrollable,
		x1:0,y1:0, x2:this.hmSpan,y2:0,
		color:colorCentral.foregroundDim,w:.5});
	// blank entire track (in case of protruding splinter tk)
	this.svgadd({type:svgt_rect_notscrollable,x:0,y:0,w:this.hmSpan,h:tkh,fill:'white'});

	// clear canvas
	tk.canvas.width=tk.canvas.width;

	if(!tk.cotton || tk.ft==FT_weaver_c) {
		var data=this.drawTrack_browser(tk,true);
		for(var j=0; j<data.length; j++) {
			this.svgadd(data[j]);
		}
	} else {
		var data=this.weaver.q[tk.cotton].drawTrack_browser(tk,true);
		for(var j=0; j<data.length; j++) {
			this.svgadd(data[j]);
		}
	}
	this.svg.gy=oldy+tkh; // never be qtc.height as this is not numerical
}
// to record the maximum height in this bbj
var maxH=this.svg.gy+this.ideogram.canvas.height;
this.svg.gy=oldgy;

/* chr ideogram below ghm 
*/
var h=this.ideogram.canvas.height;
// need to set svg.gy to below ghm
for(var i=0; i<this.tklst.length; i++) {
	var t=this.tklst[i];
	if(tkishidden(t)) continue;
	if(t.where==1) { this.svg.gy+=tk_height(t)+parseInt(t.canvas.style.paddingBottom); }
}
if(this.entire.atbplevel) {
	// sequence, svgdata is always there
	for(var i=0; i<this.ideogram.svgdata.length; i++) {
		this.svgadd(this.ideogram.svgdata[i]);
	}
} else {
	// no sequence
	var data=this.drawIdeogram_browser(true);
	for(var i=0; i<data.length; i++) {
		this.svgadd(data[i]);
	}
}
/* finally plot tk label and mcm, because they need to cover up the chrideogram
on left/right side, and tk maybe
*/
if(this.mcm) {
	// only trunk has mcm, splinter does not, need to include width of splinters for x offset
	var x=this.hmSpan;
	for(var k in this.splinters) {
		x+=this.splinters[k].hmSpan+3;
	}
	if(true) {
		// blank to mask the ruler above mcm
		this.svg.gy=0;
		this.svgadd({type:svgt_rect_notscrollable,x:x,y:0,
			w:this.mcm.lst.length*(tkAttrColumnWidth+1),
			h:this.rulercanvas.height,
			fill:'white'});
	}
	this.svg.gy=oldgy;
	var y=0;
	for(var i=0; i<this.tklst.length; i++) {
		var tk=this.tklst[i];
		if(tkishidden(tk) || tk.where!=1) continue;
		var data=this.drawMcm_onetrack(tk,true);
		for(var j=0; j<data.length; j++) {
			// adjust x
			data[j].x+=x;
			// set y
			data[j].y=y;
			this.svgadd(data[j]);
		}
		y+=tk_height(tk);
	}
	/* y is now offset for mcm term label, always underneath mcm
	mcm label is always on bottom
	blank to mask stuff below mcm
	*/
	this.svgadd({type:svgt_rect_notscrollable,x:x,y:y,
		w:this.mcm.lst.length*(tkAttrColumnWidth+1),
		h:param.svgheight,
		fill:'white'});
	for(var i=0; i<this.mcm.lst.length; i++) {
		var t=this.mcm.lst[i];
		var xx=x+(tkAttrColumnWidth+1)*i;
		var voc=gflag.mdlst[t[1]];
		this.svgadd({type:svgt_text_notscrollable,
			transform:"rotate(90 0 0)",
			x:2+y-this.svg.gx+this.svg.gy,
			y:0-4-xx-this.svg.gy-this.svg.gx,
			size:'10pt',
			text:(t[0] in voc.idx2attr ? voc.idx2attr[t[0]] : t[0])});
	}
}
if(param.showtklabel) {
	// plot tk label
	this.svg.gx=param.gx;
	this.svg.gy=this.rulercanvas.height;
	// blank out the part on left of ghm
	this.svgadd({type:svgt_rect_notscrollable,x:0,y:0,w:this.leftColumnWidth,h:param.svgheight,fill:'white'});
	for(var i=0; i<this.tklst.length; i++) {
		var tk=this.tklst[i];
		if(tkishidden(tk)) continue;
		var oldy=this.svg.gy;
		if(tk.where==2) this.svg.gy+=this.ideogram.canvas.height;
		var d=this.drawTrack_header(tk,true);
		for(var j=0; j<d.length; j++) {
			this.svgadd(d[j]);
		}
		this.svg.gy=oldy+tk_height(tk);
	}
}

return maxH;
}

function makesvg_clear() {apps.svg.urlspan.innerHTML='';}

/*** __svg__ ends ***/




function get_genome_info(event)
{
// from menu option, menu already shown
var t=event.target;
while(t.tagName!='DIV') t=t.parentNode;
gflag.menu.bbj.ajax('getgenomeinfo=on&dbName='+t.genome,function(data){show_genome_info(data);});
}
function show_genome_info(data)
{
if(!data) {
	menu_hide();
	print2console('Please try again!',2);
	return;
}
var lst=data.info.split('|');
menu_blank();
var t=dom_create('table',menu.c32);
t.style.margin=10;
for(var i=0; i<lst.length; i+=2) {
	var tr=t.insertRow(-1);
	tr.insertCell(0).innerHTML=lst[i];
	tr.insertCell(1).innerHTML=lst[i+1];
}
}

function add_new_genome()
{
oneshotDialog(3);
menu_hide();
}


/** __cmtk__ */

function cmtk_combine_change() { menu_update_track(25); }
function cmtk_combinechg_change() {menu_update_track(39); }


function cmtk_scale_change() { menu_update_track(26); }
function cmtk_filter_change() { menu_update_track(31); }
function cmtk_filter_kd(event) {if(event.keyCode==13) cmtk_filter_change();}

Browser.prototype.cmtk_combinestrands=function(tk)
{
// combine whatever data is available
var S=tk.cm.set;
if(S.rd_f || S.rd_r) {
	tk.cm.data_rd=[];
}
if(S.cg_f || S.cg_r) {
	tk.cm.data_cg=[];
}
if(S.chg_f || S.chg_r) {
	tk.cm.data_chg=[];
}
if(S.chh_f || S.chh_r) {
	tk.cm.data_chh=[];
}
if((S.rd_f && S.rd_r) || (S.cg_f && S.cg_r) || (S.chg_f && S.chg_r) || (S.chh_f && S.chh_r)) {
	// has data for reverse strand
	var bpl=this.entire.atbplevel;
	for(var i=0; i<this.regionLst.length; i++) {
		var a=[], // rd, combined
		b=[], // cg
		c=[], // chg
		d=[]; // chh
		var r=this.regionLst[i];
		var stop=bpl?(r[4]-r[3]):r[5];
		for(var j=0; j<stop; j++) {
			var a1=S.rd_f?S.rd_f.data[i][j]:NaN;
			var a2=S.rd_r?S.rd_r.data[i][j]:NaN;
			/* rd
			*/
			if(isNaN(a1)) {
				if(isNaN(a2)) {
					a[j]= NaN;
				} else {
					a[j]=a2;
				}
			} else {
				if(isNaN(a2)) {
					a[j]=a1;
				} else {
					a[j]=a1+a2;
				}
			}
			/* cg */
			var b1=S.cg_f?S.cg_f.data[i][j]:NaN;
			if(bpl) {
				var b2=S.cg_r?S.cg_r.data[i][j+1]:NaN;
				var a3= S.rd_r?S.rd_r.data[i][j+1]:NaN;
				var a_total= (isNaN(a1)?0:a1)+(isNaN(a3)?0:a3);
				if(a_total==0) {
					b[j]=NaN;
				} else {
					b[j]=((isNaN(b1)?0:(b1*a1))+(isNaN(b2)?0:(b2*a3)))/a_total;
				}
			} else {
				var b2=S.cg_r?S.cg_r.data[i][j]:NaN;
				if(isNaN(a[j]) || a[j]==0) {
					b[j]=NaN;
				} else {
					b[j]=((isNaN(b1)?0:(b1*a1))+(isNaN(b2)?0:(b2*a2)))/a[j];
				}
			}
				

			/* figure out chg/chh for "combined"
			meanwhile apply rd filtering using rd data on respective strand
			*/
			d[j]=NaN; // chh
			var x=S.chg_f?S.chg_f.data[i][j]:NaN;
			var x_r=S.chg_r?S.chg_r.data[i][j]:NaN;

			if(tk.cm.combine_chg && bpl) {
				/* new method, try to combine cag/ctg into single value
				but not for ccg/cgg
				but can only use cg_f/cg_r data to tell if at ccg/cgg
				*/
				if(!isNaN(x)) {
					if((S.cg_f && !isNaN(S.cg_f.data[i][j+1])) || (S.cg_r && !isNaN(S.cg_r.data[i][j+2]))) {
						// ccg (first c)
						c[j]=x;
					} else {
						x_r=S.chg_r?S.chg_r.data[i][j+2] : NaN;
						if(isNaN(x_r)) {
							x_r=0;
						}
						// merge two c: j, j+2
						var chg_1_rd=S.rd_f.data[i][j],
							chg_2_rd=S.rd_r.data[i][j+2];
						chg_2_rd=isNaN(chg_2_rd)?0:chg_2_rd;
						c[j]=c[j+1]=c[j+2]= ((x*chg_1_rd)+(x_r*chg_2_rd))/(chg_1_rd+chg_2_rd);
					}
				} else if(!isNaN(x_r)) {
					if((S.cg_f && !isNaN(S.cg_f.data[i][j-2])) || (S.cg_r && !isNaN(S.cg_r.data[i][j-1]))) {
						// cgg (last c)
						c[j]=x_r;
					} else {
						x=S.chg_f?S.chg_f.data[i][j-2] : NaN;
						if(isNaN(x)) {
							x=0;
						}
						// merge two c: j-2, j
						var chg_1_rd=S.rd_f.data[i][j-2],
							chg_2_rd=S.rd_r.data[i][j];
						chg_1_rd=isNaN(chg_1_rd)?0:chg_1_rd;
						c[j]=c[j-1]=c[j-2]= ((x*chg_1_rd)+(x_r*chg_2_rd))/(chg_1_rd+chg_2_rd);
					}
				}
			} else {
				/* old method
				applies to all cases, no matter if at bp level
				*/
				if(!isNaN(x)) {
					c[j]=x;
					if(tk.cm.filter && a1<tk.cm.filter) {
						c[j]=NaN;
					}
				} else {
					if(!isNaN(x_r)) {
						c[j]=x_r;
						if(tk.cm.filter && a2<tk.cm.filter) {
							c[j]=NaN;
						}
					}
				}
			}

			// chh
			var x=S.chh_f?S.chh_f.data[i][j]:NaN;
			if(!isNaN(x)) {
				d[j]=x;
				if(tk.cm.filter && a1<tk.cm.filter) {
					d[j]=NaN;
				}
			} else {
				x=S.chh_r?S.chh_r.data[i][j]:NaN;
				if(!isNaN(x)) {
					d[j]=x;
					if(tk.cm.filter && a2<tk.cm.filter) {
						d[j]=NaN;
					}
				}
			}
		}
		if(tk.cm.data_rd) {
			tk.cm.data_rd.push(a);
		}
		if(tk.cm.data_cg) {
			tk.cm.data_cg.push(b);
		}
		if(tk.cm.data_chg) {
			tk.cm.data_chg.push(c);
		}
		if(tk.cm.data_chh) {
			tk.cm.data_chh.push(d);
		}
	}
} else {
	// no reverse data
	if(S.rd_f) {
		tk.cm.data_rd=S.rd_f.data;
	}
	if(S.cg_f) {
		tk.cm.data_cg=S.cg_f.data;
	}
	if(S.chg_f) {
		tk.cm.data_chg=S.chg_f.data;
	}
	if(S.chh_f) {
		tk.cm.data_chh=S.chh_f.data;
	}
}
}

Browser.prototype.cmtk_prep_draw=function(tk,tosvg)
{
tk.canvas.width=this.entire.spnum;
var ctx=tk.canvas.getContext('2d');
// may be unitialized
if(tk.cm.set.isfirst) {
	delete tk.cm.set.isfirst;
	this.cmtk_init(tk);
}
var S=tk.cm.set;
if(S.rd_f.qtc.smooth) {
	smooth_tkdata(S.rd_f);
}
if(S.rd_r && S.rd_r.qtc.smooth) {
	smooth_tkdata(S.rd_r);
}
tk.canvas.height=cmtk_height(tk);
var svgdata=[];
if(tk.cm.combine) {
	/* combine two strands, mainly for rd and cg
	for asymetrical chg/chh level, they always belong to single strand so combining doesn't matter
	*/
	this.cmtk_combinestrands(tk);
	svgdata=this.tkplot_cm({
		cm:tk.cm,
		ctx:ctx,
		lineplot:{data:tk.cm.data_rd,
			color:tk.cm.color.rd_f,},
		barplot:{
			cg:{data:tk.cm.data_cg,
				color:tk.cm.color.cg_f,
				bg:tk.cm.bg.cg_f},
			chg:(tk.cm.data_chg?{
					data:tk.cm.data_chg,
					color:tk.cm.color.chg_f,
					bg:tk.cm.bg.chg_f}:null),
			chh:(tk.cm.data_chh?{
					data:tk.cm.data_chh,
					color:tk.cm.color.chh_f,
					bg:tk.cm.bg.chh_f}:null),
			},
		scale:tk.cm.scale,
		pointup:true,
		x:0,
		y:densitydecorpaddingtop,
		h:tk.qtc.height,
		tosvg:tosvg});
} else {
	// two strands separate
	if(!S.rd_f) fatalError('missing essential track: read depth, forward');
	if(!S.cg_f) fatalError('missing essential track: CG level, forward');
	// if reverse strand is available, use max rd from both strands
	var rdmax=qtrack_getthreshold(S.rd_f.data, {thtype:scale_auto}, this.dspBoundary.vstartr, this.dspBoundary.vstopr, this.dspBoundary.vstarts, this.dspBoundary.vstops)[0];
	if(rdmax==null) {
		rdmax=0;
	}
	if(S.rd_r) {
		var x=qtrack_getthreshold(S.rd_r.data, {thtype:scale_auto}, this.dspBoundary.vstartr, this.dspBoundary.vstopr, this.dspBoundary.vstarts, this.dspBoundary.vstops)[0];
		if(x==null) { x=0; }
		if(x>rdmax) rdmax=x;
	}
	tk.cm.rdmax=rdmax;
	// plot forward strand
	svgdata=this.tkplot_cm({
		cm:tk.cm,
		ctx:ctx,
	lineplot:{data:S.rd_f.data,
			color:tk.cm.color.rd_f,},
		linemax:rdmax,
		barplot:{
			cg:{data:S.cg_f.data,
				color:tk.cm.color.cg_f,
				bg:tk.cm.bg.cg_f},
			chg:(S.chg_f?{
					data:S.chg_f.data,
					color:tk.cm.color.chg_f,
					bg:tk.cm.bg.chg_f}:null),
			chh:(S.chh_f?{
					data:S.chh_f.data,
					color:tk.cm.color.chh_f,
					bg:tk.cm.bg.chh_f}:null),
			},
		scale:tk.cm.scale,
		pointup:true,
		x:0,
		y:densitydecorpaddingtop,
		h:tk.qtc.height,
		tosvg:tosvg});

	if(S.rd_r) {
		if(!S.cg_r) fatalError('missing essential track: CG level, reverse');
		ctx.fillStyle=colorCentral.foreground_faint_1;
		var y=densitydecorpaddingtop+tk.qtc.height;
		ctx.fillRect(0,y,tk.canvas.width,1);
		if(tosvg) svgdata.push({type:svgt_line_notscrollable,x1:0,y1:y,x2:this.hmSpan,y2:y,color:ctx.fillStyle});
		var d2=this.tkplot_cm({
			cm:tk.cm,
			ctx:ctx,
			lineplot:{data:S.rd_r.data,
				color:tk.cm.color.rd_r,},
			linemax:rdmax,
			barplot:{
				cg:{data:S.cg_r.data,
					color:tk.cm.color.cg_r,
					bg:tk.cm.bg.cg_r},
				chg:(S.chg_r?{
						data:S.chg_r.data,
						color:tk.cm.color.chg_r,
						bg:tk.cm.bg.chg_r}:null),
				chh:(S.chh_r?{
						data:S.chh_r.data, 
						color:tk.cm.color.chh_r,
						bg:tk.cm.bg.chh_r}:null),
				},
			scale:tk.cm.scale,
			pointup:false,
			x:0,
			y:y+1,
			h:tk.qtc.height,
			tosvg:tosvg});
		if(tosvg) svgdata=svgdata.concat(d2);
	}
}
if(!this.hmheaderdiv) {
	// draw scale on canvas
	if(tk.cm.combine || !tk.cm.set.rd_r) {
		var min=0,max;
		if(tk.cm.scale) {
			max=parseInt(tk.cm.rdmax);
		} else {
			max=1;
		}
		var d=plot_ruler({ctx:ctx,
			stop:densitydecorpaddingtop,
			start:densitydecorpaddingtop+tk.qtc.height-1,
			xoffset:this.hmSpan-this.move.styleLeft-10,
			horizontal:false,
			color:colorCentral.foreground,
			min:0,
			max:max,
			extremeonly:true,
			max_offset:-4,
			tosvg:tosvg,
			scrollable:true,
			});
		if(tosvg) svgdata=svgdata.concat(d);
	} else {
		ctx.fillStyle=colorCentral.foreground;
		var d=drawscale_compoundtk({ctx:ctx,
			x:this.hmSpan-this.move.styleLeft-10,
			y:densitydecorpaddingtop,
			h:tk.qtc.height,
			v1:tk.cm.scale?parseInt(tk.cm.rdmax):1,
			v2:0,
			v3:tk.cm.scale?parseInt(tk.cm.rdmax):1,
			scrollable:true,
			tosvg:tosvg});
		if(tosvg) svgdata=svgdata.concat(d);
	}
}
if(tosvg) return svgdata;
}

Browser.prototype.cmtk_init=function(tk)
{
// arg is master cm tkobj
for(var n in tk.cm.set) {
	var n2=tk.cm.set[n];
	var t=this.findTrack(n2);
	if(!t) {
		print2console('methylC track is missing a member track: '+n2,2);
		alertbox_addmsg({text:'methylC track "'+tk.label+'" is dropped because it is missing member track for '+n2});
		delete tk.cm.set[n];
	} else {
		t.mastertk=tk;
		tk.cm.set[n]=t;
		t.canvas.style.display='none';
		if(t.header) t.header.style.display='none';
		if(t.atC) t.atC.style.display='none';
	}
}
}



Browser.prototype.tkplot_cm=function(p)
{
/* not compatible with wig or line plot
handles complex case of scaling
*/
if(!p.lineplot) fatalError('tkplot_cm requires lineplot');
var svgdata=[];
if(p.linemax==undefined) {
	// linemax not provided
	var t = qtrack_getthreshold(p.lineplot.data, {thtype:scale_auto}, this.dspBoundary.vstartr, this.dspBoundary.vstopr, this.dspBoundary.vstarts, this.dspBoundary.vstops);
	p.linemax=t[0];
	p.cm.rdmax=t[0]; // for drawing scale
}
// 1. plot bars
var bpl=this.entire.atbplevel;
var w=bpl?this.entire.bpwidth:1;
var barmax=1; // !!! hard-coded max value for methylation level, incompatible with other applications
var tmp={};

for(var i=0; i<this.regionLst.length; i++) {
	var r=this.regionLst[i];
	var stop=bpl?(r[4]-r[3]):r[5];
	var bgcg=[], hasbgcg=false,
		bgchg=[], hasbgchg=false,
		bgchh=[], hasbgchh=false,
		cg=[], hascg=false,
		chg=[], haschg=false,
		chh=[], haschh=false;
	for(var j=0; j<stop; j++) {
		bgcg[j]=bgchg[j]=bgchh[j]=cg[j]=chg[j]=chh[j]=NaN;
	}
	for(var j=0; j<stop; j++) {
		var v=p.lineplot.data[i][j]; // read depth, might be used to scale background bar height
		if(isNaN(v)) {
			// allowed: no read coverage but the methyc value is 0, only plot bg
			v=0;
		}
		if(!p.cm.filter || p.lineplot.data[i][j]>=p.cm.filter) {
			if(p.barplot.cg.data[i][j]>=0) {
				cg[j]=p.barplot.cg.data[i][j] * (p.scale?v/p.linemax:1);
				hascg=true;
				if(p.cm.combine && bpl) {
					cg[j+1]=cg[j];
				}
			}
			if(p.barplot.chg) {
				chg[j]=p.barplot.chg.data[i][j] * (p.scale?v/p.linemax:1);
				haschg=true;
			}
			if(p.barplot.chh) {
				chh[j]=p.barplot.chh.data[i][j] * (p.scale?v/p.linemax:1);
				haschh=true;
			}
		}
		if(!isNaN(cg[j])) {
			bgcg[j]=p.scale?v/p.linemax:1;
			hasbgcg=true;
		} else if(!isNaN(chg[j])) {
			bgchg[j]=p.scale?v/p.linemax:1;
			hasbgchg=true;
		} else if(!isNaN(chh[j])) {
			bgchh[j]=p.scale?v/p.linemax:1;
			hasbgchh=true;
		}
	}
	var x=this.cumoffset(i,r[3]);
	if(hasbgcg) {
		var svd=this.barplot_base({
			data:bgcg,
			ctx:p.ctx,
			colors:{p:p.barplot.cg.bg},
			tk:{minv:0,maxv:1},
			rid:i,
			x:x,
			y:p.y,
			h:p.h,
			pointup:p.pointup,
			tosvg:p.tosvg});
		if(p.tosvg) svgdata=svgdata.concat(svd);
	}
	if(hasbgchg) {
		var svd=this.barplot_base({
			data:bgchg,
			ctx:p.ctx,
			colors:{p:p.barplot.chg.bg},
			tk:{minv:0,maxv:1},
			rid:i,
			x:x,
			y:p.y,
			h:p.h,
			pointup:p.pointup,
			tosvg:p.tosvg});
		if(p.tosvg) svgdata=svgdata.concat(svd);
	}
	if(hasbgchh) {
		var svd=this.barplot_base({
			data:bgchh,
			ctx:p.ctx,
			colors:{p:p.barplot.chh.bg},
			tk:{minv:0,maxv:1},
			rid:i,
			x:x,
			y:p.y,
			h:p.h,
			pointup:p.pointup,
			tosvg:p.tosvg});
		if(p.tosvg) svgdata=svgdata.concat(svd);
	}
	if(hascg) {
		var svd=this.barplot_base({
			data:cg,
			ctx:p.ctx,
			colors:{p:p.barplot.cg.color},
			tk:{minv:0,maxv:1},
			rid:i,
			x:x,
			y:p.y,
			h:p.h,
			pointup:p.pointup,
			tosvg:p.tosvg});
		if(p.tosvg) svgdata=svgdata.concat(svd);
	}
	if(haschg) {
		var svd=this.barplot_base({
			data:chg,
			ctx:p.ctx,
			colors:{p:p.barplot.chg.color},
			tk:{minv:0,maxv:1},
			rid:i,
			x:x,
			y:p.y,
			h:p.h,
			pointup:p.pointup,
			tosvg:p.tosvg});
		if(p.tosvg) svgdata=svgdata.concat(svd);
	}
	if(haschh) {
		var svd=this.barplot_base({
			data:chh,
			ctx:p.ctx,
			colors:{p:p.barplot.chh.color},
			tk:{minv:0,maxv:1},
			rid:i,
			x:x,
			y:p.y,
			h:p.h,
			pointup:p.pointup,
			tosvg:p.tosvg});
		if(p.tosvg) svgdata=svgdata.concat(svd);
	}
}
if(!p.scale) {
	var d=this.tkplot_line({
		ctx:p.ctx,
		max:p.linemax, min:0,
		tk:p.lineplot,
		color:p.lineplot.color,
		linewidth:1,
		x:p.x, y:p.y, w:w, h:p.h,
		pointup:p.pointup,
		tosvg:p.tosvg});
	if(p.tosvg) svgdata=svgdata.concat(d);
}
if(p.tosvg) return svgdata;
}

function cmtk_detail(tk,A,B)
{
// A: region id, B: spnum
if(tk.cm.combine) {
	var a=tk.cm.data_cg[A][B];
	var d=tk.cm.data_rd[A][B];
	var b=NaN, // chg
		b_rd; // chg rd, asymmetrical, use rd data on original strand!!
	if(tk.cm.data_chg) {
		b=tk.cm.data_chg[A][B];
		if(!isNaN(b)) {
			if(isNaN(tk.cm.set.chg_f.data[A][B])) {
				b_rd=tk.cm.set.rd_r.data[A][B];
			} else {
				b_rd=tk.cm.set.rd_f.data[A][B];
			}
		}
	}
	var c=NaN, // chh
		c_rd; // chh rd
	if(tk.cm.data_chh) {
		c=tk.cm.data_chh[A][B];
		if(!isNaN(c)) {
			if(isNaN(tk.cm.set.chh_f.data[A][B])) {
				c_rd=tk.cm.set.rd_r.data[A][B];
			} else {
				c_rd=tk.cm.set.rd_f.data[A][B];
			}
		}
	}
	return '<div style="color:white;"><table style="margin:5px;color:inherit;"><tr>'+
		(isNaN(d)?'<td colspan=2>no reads</td>':'<td>Combined read depth</td><td>'+parseInt(d)+'</td>')+'</tr><tr>'+
		(isNaN(a)?'':'<td><div class=squarecell style="display:inline-block;background-color:'+tk.cm.color.cg_f+';"></div> CG</td><td>'+neat_0t1(a)+'</td>')+
		'</tr><tr>'+
		// chg
		(isNaN(b)?'':'<td><div class=squarecell style="display:inline-block;background-color:'+tk.cm.color.chg_f+';"></div> CHG</td><td>'+neat_0t1(b)+
			(tk.cm.combine_chg?'':' <span style="font-size:70%">(strand-specific read depth: '+parseInt(b_rd)+')</span>')+
			'</td>')+
		'</tr><tr>'+
		// chh
		(isNaN(c)?'':'<td><div class=squarecell style="display:inline-block;background-color:'+tk.cm.color.chh_f+';"></div> CHH</td><td>'+neat_0t1(c)+' <span style="font-size:70%">(strand-specific read depth: '+parseInt(c_rd)+')</span></td>')+
		'</tr></table>'+
		'</div>';
}
var s=tk.cm.set;
var a1=s.cg_f.data[A][B],
b1=s.chg_f?s.chg_f.data[A][B]:NaN,
c1=s.chh_f?s.chh_f.data[A][B]:NaN,
d1=s.rd_f.data[A][B],
a2=s.cg_r?s.cg_r.data[A][B]:NaN,
b2=s.chg_r?s.chg_r.data[A][B]:NaN,
c2=s.chh_r?s.chh_r.data[A][B]:NaN,
d2=s.rd_r?s.rd_r.data[A][B]:NaN;
return '<div style="color:white;"><table style="margin:5px;color:inherit;">'+
	'<tr><td style="font-size:150%">&raquo;</td>'+
	(isNaN(d1)?'<td colspan=2>no reads</td>':'<td>Read depth</td><td>'+parseInt(d1)+'</td>')+
	'</tr><tr><td></td>'+
	(isNaN(a1)?'':'<td><div class=squarecell style="display:inline-block;background-color:'+tk.cm.color.cg_f+';"></div> CG</td><td>'+neat_0t1(a1)+'</td>')+
	'</tr><tr><td></td>'+
	(isNaN(b1)?'':'<td><div class=squarecell style="display:inline-block;background-color:'+tk.cm.color.chg_f+';"></div> CHG</td><td>'+neat_0t1(b1)+'</td>')+
	'</tr><tr><td></td>'+
	(isNaN(c1)?'':'<td><div class=squarecell style="display:inline-block;background-color:'+tk.cm.color.chh_f+';"></div> CHH</td><td>'+neat_0t1(c1)+'</td>')+
	'</tr><tr><td style="font-size:150%;">&laquo;</td>'+
	(isNaN(d2)?'<td colspan=2>no reads</td>':'<td>Read depth</td><td>'+parseInt(d2)+'</td>')+
	'</tr><tr><td></td>'+
	(isNaN(a2)?'':'<td><div class=squarecell style="display:inline-block;background-color:'+tk.cm.color.cg_r+';"></div> CG</td><td>'+neat_0t1(a2)+'</td>')+
	'</tr><tr><td></td>'+
	(isNaN(b2)?'':'<td><div class=squarecell style="display:inline-block;background-color:'+tk.cm.color.chg_r+';"></div> CHG</td><td>'+neat_0t1(b2)+'</td>')+
	'</tr><tr><td></td>'+
	(isNaN(c2)?'':'<td><div class=squarecell style="display:inline-block;background-color:'+tk.cm.color.chh_r+';"></div> CHH</td><td>'+neat_0t1(c2)+'</td>')+
	'</tr></table>'+
	'</div>';
}
/** __cmtk__ ends */

/** __misc__ */
function blog_facet() {window.open("http://washugb.blogspot.com/2013/09/v24-3-of-3-facet-panel.html");}
function blog_session() {window.open("http://washugb.blogspot.com/2014/01/v31-2-of-3-sessions.html");}
function blog_fud() {window.open("http://washugb.blogspot.com/2014/01/v31-3-of-3-file-upload.html");}
function blog_publichub() {window.open("http://washugb.blogspot.com/2013/07/v22-2-of-3-public-datahubs.html");}
function blog_geneset() {window.open("http://washugb.blogspot.com/2013/07/v21-creating-and-managing-multiple-gene.html");}
function blog_circlet() {window.open('http://washugb.blogspot.com/2013/04/v17-circlet-view.html');}
function app_get_sequence(event)
{
var bbj=gflag.menu.bbj;
var lst=menu.apppanel.getseq.input.value.split('\n');
if(lst.length==0) {
	print2console('No coordinates given',2);
	return;
}
var gc=[],
	lc=[]; // for looking
for(var i=0; i<lst.length; i++) {
	var c=bbj.genome.parseCoordinate(lst[i],2);
	if(c && c[0]==c[2]) {
		if(c[3]-c[1]>5000) {
			print2console('Sequence was trimmed to 5kb',2);
			c[3]=c[1]+5000;
		}
		gc.push(c[0]+','+c[1]+','+c[3]);
		lc.push(c[0]+':'+c[1]+'-'+c[3]);
	}
}
if(gc.length==0) {
	print2console('No acceptable coordinates, please check your input',2);
	return;
}
event.target.disabled=true;
bbj.ajax("getChromseq=on&regionlst="+gc.join(',')+'&dbName='+bbj.genome.name, function(data){app_showseq(data,lc);});
}
function app_showseq(data,coordlst)
{
menu.apppanel.getseq.butt.disabled=false;
if(!data || !data.lst) {
	print2console('Error retrieving sequence, please try again.',2);
	return;
}
menu.apppanel.getseq.main.style.display='none';
menu.c32.style.display='block';
stripChild(menu.c32,0);
var d=dom_create('div',menu.c32,'width:500px;margin:15px;');
for(var i=0; i<data.lst.length; i++) {
	dom_create('div',d,'opacity:.7').innerHTML='>'+coordlst[i];
	dom_create('div',d,'word-wrap:break-word;font-family:Courier;font-size:80%;').innerHTML=data.lst[i];
}
placePanel(menu);
}
/** __misc__ */

/** __pca__ */
function pca_busy(msg)
{
var b=apps.pca.busy;
b.style.display='block';
b.style.width=apps.pca.width;
b.style.height=apps.pca.height;
b.says.innerHTML=msg;
apps.pca.dotholder.appendChild(b);
}
/** __pca__ ends */

/** __rnavi__ navigate region */
function toggle30()
{
apps.navregion.shortcut.style.display='inline-block';
if(apps.navregion.main.style.display=="none") {
	panelFadein(apps.navregion.main, 100+document.body.scrollLeft, 50+document.body.scrollTop);
} else {
	panelFadeout(apps.navregion.main);
}
menu_hide();
}

function navregion_prev()
{
if(bbjisbusy()) return;
if(apps.navregion.idx<=0) return;
navregion_use(apps.navregion.holder.childNodes[--apps.navregion.idx]);
}
function navregion_next()
{
if(bbjisbusy()) return;
var lst=apps.navregion.holder.childNodes;
if(lst.length-1<=apps.navregion.idx) return;
navregion_use(lst[++apps.navregion.idx]);
}
function navregion_go(event)
{
if(bbjisbusy()) return;
navregion_use(event.target);
}
function navregion_use(d)
{
var lst=apps.navregion.holder.childNodes;
for(var i=0; i<lst.length; i++) {
	lst[i].className='header_b';
	if(lst[i].innerHTML==d.innerHTML) apps.navregion.idx=i;
}
d.className='header_r';
var b=gflag.browser;
b.weavertoggle(d.stop-d.start);
b.cgiJump2coord(d.coord);
}

/** __rnavi__ ends */


/** __app__ */
function findApp_butt(event){simulateEvent(event.target.previousSibling,'keyup');}
function findApp(event)
{
var s=event.target.value;
if(s.length==0) {
	menu2_hide();
	return;
}
var ss=s.toLowerCase();
var lst=[];
for(var i=0; i<gflag.applst.length; i++) {
	var a=gflag.applst[i];
	if(a.name.toLowerCase().indexOf(ss)!=-1) {
		lst.push(a);
	} else if(a.label && a.label.toLowerCase().indexOf(ss)!=-1) {
		lst.push(a);
	}
}
if(lst.length==0) {
	menu2_hide();
	if(event.keyCode==13) print2console('No apps found',2);
	return;
}
if(lst.length==1 && event.keyCode==13) {
	menu2_hide();
	lst[0].toggle();
	return;
}
menu2_show();
var p=absolutePosition(event.target);
menu2.style.left=p[0];
menu2.style.top=p[1]+20;
stripChild(menu2,0);
for(var i=0; i<lst.length; i++) {
	dom_create('div',menu2,'font-size:120%;padding:5px 10px;',{c:'menu2ele',t:lst[i].name,clc:invokeapp_closure(lst[i].toggle)});
}
}
function invokeapp_closure(call) {return function(){menu2_hide();call();}}

function launchappPanel(event)
{
menu_shutup();
menu.apppanel.style.display='block';
menu_show_beneathdom(17,event.target);
//menu.apppanel.kwinput.focus();
}
function showallapp()
{
menu_blank();
var d2=dom_create('div',menu.c32,'margin:20px;resize:both;width:'+(gflag.browser.hmSpan/2)+'px;');
for(var i=0; i<gflag.applst.length; i++) {
	var a=gflag.applst[i];
	var d=dom_create('div',d2,'display:inline-block;margin:10px 15px;padding:5px 10px;background-color:#ededed;',
		{t:'<b>'+a.name+'</b>'+(a.label?'<div style="font-size:80%">'+a.label+'</div>':''),
		c:'opaque7',
		clc:a.toggle});
}
placePanel(menu);
}

/** __app__ end */
