'use strict';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const FDA = 'https://api.fda.gov';

const COMMON_DRUGS = [
    'Aspirin','Ibuprofen','Acetaminophen','Naproxen','Celecoxib',
    'Atorvastatin','Simvastatin','Rosuvastatin','Pravastatin','Lovastatin',
    'Amoxicillin','Azithromycin','Ciprofloxacin','Doxycycline','Metronidazole',
    'Penicillin','Cephalexin','Clindamycin','Trimethoprim','Nitrofurantoin',
    'Sertraline','Fluoxetine','Escitalopram','Bupropion','Venlafaxine',
    'Paroxetine','Citalopram','Duloxetine','Mirtazapine','Amitriptyline',
    'Lisinopril','Amlodipine','Metoprolol','Losartan','Hydrochlorothiazide',
    'Atenolol','Carvedilol','Ramipril','Valsartan','Furosemide',
    'Metformin','Glipizide','Sitagliptin','Empagliflozin','Ozempic',
    'Semaglutide','Tirzepatide','Insulin','Glargine','Liraglutide',
    'Adderall','Ritalin','Methylphenidate','Atomoxetine','Amphetamine',
    'Omeprazole','Pantoprazole','Famotidine','Lansoprazole','Esomeprazole',
    'Albuterol','Montelukast','Fluticasone','Budesonide','Ipratropium',
    'Warfarin','Apixaban','Rivaroxaban','Clopidogrel','Enoxaparin',
    'Gabapentin','Pregabalin','Tramadol','Oxycodone','Morphine',
    'Levothyroxine','Methimazole','Prednisone','Dexamethasone','Methylprednisolone',
];

const DRUG_CLASSES = {
    'NSAIDs':          ['Aspirin','Ibuprofen','Naproxen','Celecoxib'],
    'Statins':         ['Atorvastatin','Simvastatin','Rosuvastatin','Pravastatin'],
    'Antibiotics':     ['Amoxicillin','Azithromycin','Ciprofloxacin','Doxycycline'],
    'Antidepressants': ['Sertraline','Fluoxetine','Escitalopram','Bupropion'],
    'Blood Pressure':  ['Lisinopril','Amlodipine','Metoprolol','Losartan'],
    'Diabetes':        ['Metformin','Ozempic','Sitagliptin','Empagliflozin'],
};

/* ─── State ──────────────────────────────────────────────────────────────── */
const charts = {};
let selectedClassDrugs = [];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

function show(id)  { $(id).classList.remove('hidden'); }
function hide(id)  { $(id).classList.add('hidden'); }
function cap(s)    { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''; }
function fmt(n)    { return n ? n.toLocaleString() : '0'; }
function truncate(s, n) { return s && s.length > n ? s.slice(0, n) + '…' : (s || ''); }

function formatRecallDate(raw) {
    if (!raw || raw.length < 8) return 'Unknown date';
    return `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;
}

function recallBadgeClass(cls) {
    if (!cls) return 'badge-unk';
    if (/class\s*i(?!i)/i.test(cls))   return 'badge-I';
    if (/class\s*ii(?!i)/i.test(cls))  return 'badge-II';
    if (/class\s*iii/i.test(cls))      return 'badge-III';
    return 'badge-unk';
}

/* ─── API ────────────────────────────────────────────────────────────────── */
async function apiFetch(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
}

async function getEventCount(drug) {
    const q = encodeURIComponent(`patient.drug.medicinalproduct:"${drug.toUpperCase()}"`);
    const data = await apiFetch(`${FDA}/drug/event.json?search=${q}&limit=1`);
    return data?.meta?.results?.total ?? 0;
}

async function getTopReactions(drug) {
    const q = encodeURIComponent(`patient.drug.medicinalproduct:"${drug.toUpperCase()}"`);
    const data = await apiFetch(`${FDA}/drug/event.json?search=${q}&count=patient.reaction.reactionmeddrapt.exact&limit=15`);
    return data?.results ?? [];
}

async function getLabel(drug) {
    // Try generic name, then brand name
    for (const field of ['openfda.generic_name', 'openfda.brand_name']) {
        const q = encodeURIComponent(`${field}:"${drug}"`);
        const data = await apiFetch(`${FDA}/drug/label.json?search=${q}&limit=1`);
        if (data?.results?.length) return data.results[0];
    }
    return null;
}

async function getRecalls(drug) {
    const q = encodeURIComponent(`generic_name:"${drug}"`);
    const data = await apiFetch(`${FDA}/drug/enforcement.json?search=${q}&limit=10`);
    return data?.results ?? [];
}

async function loadDrugData(drug) {
    const [eventCount, reactions, label, recalls] = await Promise.all([
        getEventCount(drug),
        getTopReactions(drug),
        getLabel(drug),
        getRecalls(drug),
    ]);
    return { eventCount, reactions, label, recalls };
}

/* ─── Render: Overview ───────────────────────────────────────────────────── */
function renderOverview(panelId, drugName, d) {
    const panel = $(panelId);
    const { eventCount, reactions, recalls } = d;
    const classI = recalls.filter(r => /class\s*i(?!i)/i.test(r.classification || '')).length;
    const top5 = reactions.slice(0, 5);
    const maxCount = top5[0]?.count || 1;

    panel.innerHTML = `
        <h3 class="panel-name">${drugName}</h3>
        <div class="ov-stat-row">
            <span class="ov-stat-label">Total Event Reports</span>
            <span class="ov-stat-val" style="color:var(--blue)">${fmt(eventCount)}</span>
        </div>
        <div class="ov-stat-row">
            <span class="ov-stat-label">Recalls Found</span>
            <span class="ov-stat-val" style="color:${recalls.length > 0 ? 'var(--orange)' : 'var(--green)'}">${recalls.length}</span>
        </div>
        ${classI > 0 ? `
        <div class="ov-stat-row">
            <span class="ov-stat-label">Class I (Serious) Recalls</span>
            <span class="ov-stat-val" style="color:var(--red)">${classI}</span>
        </div>` : ''}
        ${top5.length ? `
        <div class="mini-bar-section">
            <div class="mini-bar-title">Top Reported Reactions</div>
            ${top5.map(r => `
                <div class="mini-bar-row">
                    <span class="mini-bar-name" title="${r.term}">${r.term.toLowerCase()}</span>
                    <div class="mini-bar-track">
                        <div class="mini-bar-fill" style="width:${Math.max(3,(r.count/maxCount)*100)}%"></div>
                    </div>
                    <span class="mini-bar-count">${fmt(r.count)}</span>
                </div>
            `).join('')}
        </div>` : ''}
    `;
}

/* ─── Render: Bar Chart (Stretch Goal 2) ─────────────────────────────────── */
function renderChart(canvasId, reactions) {
    const canvas = $(canvasId);
    if (!canvas) return;

    if (charts[canvasId]) { charts[canvasId].destroy(); delete charts[canvasId]; }

    if (!reactions?.length) {
        canvas.parentElement.innerHTML = '<div class="no-data"><span class="no-data-icon">📊</span>No reaction data found for this drug.</div>';
        return;
    }

    const top = reactions.slice(0, 12);
    const labels = top.map(r => r.term.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()));
    const values = top.map(r => r.count);
    const colors = values.map((_, i) => `hsla(213, 72%, ${28 + i * 3.5}%, 0.85)`);

    charts[canvasId] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Reports',
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.85', '1')),
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} reports` }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
                y: { grid: { display: false }, ticks: { font: { size: 11 } } }
            }
        }
    });
}

/* ─── Render: Recalls ────────────────────────────────────────────────────── */
function renderRecalls(listId, nameId, drugName, recalls) {
    $(nameId).textContent = drugName;
    const el = $(listId);
    if (!recalls?.length) {
        el.innerHTML = '<div class="no-data"><span class="no-data-icon">✅</span>No recalls found for this drug.</div>';
        return;
    }
    el.innerHTML = recalls.map(r => {
        const badgeCls = recallBadgeClass(r.classification);
        const isOngoing = /ongoing/i.test(r.status || '');
        return `
        <div class="recall-card">
            <div class="recall-card-top">
                <span class="recall-badge ${badgeCls}">${r.classification || 'Unknown'}</span>
                <span class="recall-date">${formatRecallDate(r.recall_initiation_date)}</span>
            </div>
            <div class="recall-product">${truncate(r.product_description || r.brand_name || 'Unknown product', 100)}</div>
            <div class="recall-reason">${truncate(r.reason_for_recall || 'Reason not specified', 220)}</div>
            <span class="recall-status-pill ${isOngoing ? 'pill-ongoing' : 'pill-completed'}">${r.status || 'Unknown status'}</span>
        </div>`;
    }).join('');
}

/* ─── Render: Label (Stretch Goal 1 — contextual help on every section) ─── */
function renderLabel(contentId, nameId, drugName, label) {
    $(nameId).textContent = drugName;
    const el = $(contentId);
    if (!label) {
        el.innerHTML = '<div class="no-data"><span class="no-data-icon">📋</span>No label data found.</div>';
        return;
    }

    const sections = [
        { key: 'boxed_warning',        title: 'Boxed Warning',          icon: '⛔', boxed: true,
          tip: 'Boxed warnings (also called "black box warnings") are the FDA\'s strongest warning. They indicate serious or life-threatening risks.' },
        { key: 'warnings',             title: 'Warnings',               icon: '⚠️',
          tip: 'Serious adverse reactions or potential safety hazards that do not meet the threshold for a boxed warning.' },
        { key: 'indications_and_usage',title: 'Indications & Usage',    icon: '💊',
          tip: 'The diseases or conditions for which the drug has been officially approved by the FDA.' },
        { key: 'contraindications',    title: 'Contraindications',      icon: '🚫',
          tip: 'Situations in which the drug should NOT be used because the risk clearly outweighs any benefit.' },
        { key: 'adverse_reactions',    title: 'Adverse Reactions',      icon: '📋',
          tip: 'Known adverse reactions from clinical trials and post-marketing surveillance included in the official label.' },
    ];

    const html = sections.map(s => {
        const content = label[s.key]?.[0];
        if (!content) return '';
        const text = truncate(content, 500);
        if (s.boxed) return `
            <div class="boxed-warning-block">
                <div class="boxed-warning-title">⛔ Boxed Warning
                    <button class="info-btn" data-tip="${s.tip}" style="margin-left:6px">ℹ</button>
                </div>
                ${text}
            </div>`;
        return `
            <div class="label-block">
                <div class="label-block-title">${s.icon} ${s.title}
                    <button class="info-btn" data-tip="${s.tip}" style="margin-left:4px">ℹ</button>
                </div>
                <div class="label-block-body">${text}</div>
            </div>`;
    }).filter(Boolean).join('');

    el.innerHTML = html || '<div class="no-data"><span class="no-data-icon">📋</span>Limited label data available.</div>';
}

/* ─── Main Compare Flow ──────────────────────────────────────────────────── */
async function compare(drug1, drug2) {
    // Hide results, show loading
    hide('drugHeaders');
    hide('statsGrid');
    hide('disclaimer');
    hide('mainCard');
    show('loadingState');

    const [d1, d2] = await Promise.all([loadDrugData(drug1), loadDrugData(drug2)]);

    hide('loadingState');

    // Drug name headers
    $('drug1Name').textContent = drug1;
    $('drug2Name').textContent = drug2;
    show('drugHeaders');

    // Stats
    $('d1Events').textContent  = fmt(d1.eventCount);
    $('d2Events').textContent  = fmt(d2.eventCount);
    $('d1Recalls').textContent = d1.recalls.length;
    $('d2Recalls').textContent = d2.recalls.length;
    show('statsGrid');

    show('disclaimer');

    // Overview
    renderOverview('overviewPanel1', drug1, d1);
    renderOverview('overviewPanel2', drug2, d2);

    // Adverse events chart names
    $('eventsName1').textContent = drug1;
    $('eventsName2').textContent = drug2;
    renderChart('chart1', d1.reactions);
    renderChart('chart2', d2.reactions);

    // Recalls
    renderRecalls('recallsList1', 'recallsName1', drug1, d1.recalls);
    renderRecalls('recallsList2', 'recallsName2', drug2, d2.recalls);

    // Labels
    renderLabel('labelContent1', 'labelsName1', drug1, d1.label);
    renderLabel('labelContent2', 'labelsName2', drug2, d2.label);

    show('mainCard');

    // Reset to overview tab
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="overview"]').classList.add('active');
    $('tab-overview').classList.add('active');
}

/* ─── Tabs ───────────────────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        $(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});

/* ─── Tooltip (Stretch Goal 1) ───────────────────────────────────────────── */
const tooltip = $('tooltip');
document.addEventListener('mouseover', e => {
    const btn = e.target.closest('[data-tip]');
    if (!btn) return;
    tooltip.textContent = btn.dataset.tip;
    tooltip.classList.add('show');
});
document.addEventListener('mousemove', e => {
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top  = (e.clientY + 14) + 'px';
});
document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-tip]')) tooltip.classList.remove('show');
});

/* ─── Autocomplete ───────────────────────────────────────────────────────── */
function setupAutocomplete(inputId, listId) {
    const input = $(inputId);
    const list  = $(listId);
    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        if (val.length < 2) { list.innerHTML = ''; return; }
        const matches = COMMON_DRUGS.filter(d => d.toLowerCase().startsWith(val)).slice(0, 8);
        list.innerHTML = matches.map(d => `<option value="${d}">`).join('');
    });
}
setupAutocomplete('drugInput1', 'drugList1');
setupAutocomplete('drugInput2', 'drugList2');

/* ─── Compare Button ─────────────────────────────────────────────────────── */
$('compareBtn').addEventListener('click', () => {
    const d1 = $('drugInput1').value.trim();
    const d2 = $('drugInput2').value.trim();
    if (d1 && d2) compare(d1, d2);
});
['drugInput1','drugInput2'].forEach(id => {
    $(id).addEventListener('keydown', e => { if (e.key === 'Enter') $('compareBtn').click(); });
});

/* ─── Drug Class Modal (Stretch Goal 3) ─────────────────────────────────── */
document.querySelectorAll('.class-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cls   = btn.dataset.class;
        const drugs = DRUG_CLASSES[cls];
        if (!drugs) return;

        selectedClassDrugs = [];
        $('modalTitle').textContent    = cls;
        $('modalSubtitle').textContent = `Select any two ${cls} to compare`;
        $('classDrugGrid').innerHTML   = drugs.map(d =>
            `<div class="class-drug-item" data-drug="${d}">${d}</div>`
        ).join('');
        $('modalCompare').disabled = true;

        $('classDrugGrid').querySelectorAll('.class-drug-item').forEach(item => {
            item.addEventListener('click', () => {
                const drug = item.dataset.drug;
                if (item.classList.contains('selected')) {
                    item.classList.remove('selected');
                    selectedClassDrugs = selectedClassDrugs.filter(d => d !== drug);
                } else if (selectedClassDrugs.length < 2) {
                    item.classList.add('selected');
                    selectedClassDrugs.push(drug);
                }
                $('modalCompare').disabled = selectedClassDrugs.length !== 2;
            });
        });

        document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $('classModal').classList.add('show');
    });
});

function closeModal() {
    $('classModal').classList.remove('show');
    document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
}

$('modalClose').addEventListener('click', closeModal);
$('modalCancel').addEventListener('click', closeModal);
$('classModal').addEventListener('click', e => { if (e.target === $('classModal')) closeModal(); });

$('modalCompare').addEventListener('click', () => {
    if (selectedClassDrugs.length === 2) {
        $('drugInput1').value = selectedClassDrugs[0];
        $('drugInput2').value = selectedClassDrugs[1];
        closeModal();
        compare(selectedClassDrugs[0], selectedClassDrugs[1]);
    }
});

/* ─── Boot ───────────────────────────────────────────────────────────────── */
$('drugInput1').value = 'Aspirin';
$('drugInput2').value = 'Ibuprofen';
compare('Aspirin', 'Ibuprofen');
