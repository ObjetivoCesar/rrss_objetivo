'use client';

import React, { useEffect, useState } from "react";
import { Eye, Edit3, Search, Calendar, Film, Layers, Check, Loader2, Play } from "lucide-react";
import toast from "react-hot-toast";

interface ContentRow {
  Día: string;
  Fecha: string;
  Hora: string;
  Formato: string;
  "Hook / Tema": string;
  "Descripción Visual": string;
  "Copy Sugerido": string;
  CTA: string;
  "Guion Grabación"?: string;
  "SEO Keywords"?: string;
  [key: string]: any;
}

export default function BrandSpreadsheet() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("TODOS");
  const [selectedDay, setSelectedDay] = useState("TODOS");
  
  // Edición
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  // Teleprompter / Detalle
  const [selectedRow, setSelectedRow] = useState<ContentRow | null>(null);
  const [fontSize, setFontSize] = useState(24); // Tamaño de letra inicial grande

  useEffect(() => {
    setMounted(true);
    fetchPlannerData();
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-white">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Cargando...</p>
      </div>
    );
  }

  async function fetchPlannerData() {
    try {
      setLoading(true);
      const res = await fetch("/api/brand-planner");
      if (!res.ok) throw new Error("Error al cargar datos");
      const json = await res.json();
      setData(json.data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCellClick = (rowIndex: number, column: string, value: string) => {
    setEditingCell({ rowIndex, column });
    setEditValue(value);
  };

  const handleSaveCell = async (rowIndex: number, column: string) => {
    if (!editingCell) return;
    
    const valueToSave = editValue;
    setEditingCell(null);
    
    // Si no cambió el valor, no hacemos nada
    if (data[rowIndex][column] === valueToSave) return;

    // Actualizar el estado local en caliente inmediatamente para que visualmente persista
    const updatedData = [...data];
    updatedData[rowIndex][column] = valueToSave;
    setData(updatedData);

    try {
      setSavingIndex(rowIndex);
      const res = await fetch("/api/brand-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex,
          column,
          newValue: valueToSave
        })
      });

      if (!res.ok) throw new Error("Error al guardar celda");
      
      // Si el panel de teleprompter está viendo este registro, actualizarlo también
      if (selectedRow && updatedData[rowIndex]["Día"] === selectedRow["Día"] && updatedData[rowIndex]["Hora"] === selectedRow["Hora"]) {
        setSelectedRow(updatedData[rowIndex]);
      }
      
      toast.success("Sincronizado con CSV y MD ✓");
    } catch (err: any) {
      toast.error(err.message);
      // Revertir el valor en caso de error
      fetchPlannerData();
    } finally {
      setSavingIndex(null);
    }
  };

  // Filtrar datos según criterios
  const filteredData = data.filter(row => {
    const matchesSearch = 
      row["Hook / Tema"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row["Copy Sugerido"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row["Día"]?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFormat = 
      selectedFormat === "TODOS" || 
      row["Formato"]?.toUpperCase().includes(selectedFormat.toUpperCase());

    const matchesDay = 
      selectedDay === "TODOS" || 
      row["Día"]?.toUpperCase() === selectedDay.toUpperCase();

    return matchesSearch && matchesFormat && matchesDay;
  });

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden text-white">
      
      {/* ── Sección Principal: Tabla de Control (Spreadsheet) ── */}
      <div className="flex-1 flex flex-col bg-black/60 border border-neutral-800 rounded-3xl overflow-hidden backdrop-blur-xl p-6 shadow-2xl">
        
        {/* Barra de Filtros y Herramientas */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" /> SPREADSHEET PLANNER
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-widest mt-1">Marca Personal · César Reyes</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar hook, copy o tag..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 text-xs px-9 py-2.5 rounded-xl outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-neutral-500 w-56 font-medium"
              />
            </div>

            {/* Filtro Día */}
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs px-3 py-2.5 rounded-xl outline-none cursor-pointer text-white font-bold"
            >
              <option value="TODOS">📆 TODOS LOS DÍAS</option>
              <option value="SÁBADO">SÁBADO</option>
              <option value="DOMINGO">DOMINGO</option>
              <option value="LUNES">LUNES</option>
              <option value="MARTES">MARTES</option>
              <option value="MIÉRCOLES">MIÉRCOLES</option>
              <option value="JUEVES">JUEVES</option>
              <option value="VIERNES">VIERNES</option>
            </select>

            {/* Filtro Formato */}
            <select
              value={selectedFormat}
              onChange={e => setSelectedFormat(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs px-3 py-2.5 rounded-xl outline-none cursor-pointer text-white font-bold"
            >
              <option value="TODOS">🎬 TODOS LOS FORMATOS</option>
              <option value="REEL">REELS</option>
              <option value="HISTORIA">HISTORIAS</option>
            </select>
          </div>
        </div>

        {/* Tabla tipo spreadsheet */}
        <div className="flex-1 overflow-auto border border-neutral-800 rounded-2xl bg-neutral-950/60 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Cargando base de datos...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-neutral-500 text-xs uppercase tracking-widest font-bold">
              Sin coincidencias para los filtros aplicados
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-neutral-900/80 border-b border-neutral-800 sticky top-0 z-10">
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider w-24">Día</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider w-16">Hora</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider w-28">Formato</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider w-64">Hook / Tema</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider w-80">Copy Sugerido</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider w-80">Guion Grabación</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider w-64">Keywords SEO</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider w-40">CTA</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider w-20 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => {
                  const isReel = row["Formato"]?.toUpperCase().includes("REEL");
                  const isSaving = savingIndex === idx;
                  
                  return (
                    <tr key={idx} className="border-b border-neutral-900 hover:bg-neutral-900/20 transition-all group">
                      
                      {/* Día */}
                      <td className="px-4 py-3 text-xs font-black text-white whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isReel ? "bg-red-500" : "bg-indigo-400"}`} />
                          {row["Día"]}
                        </span>
                      </td>

                      {/* Hora */}
                      <td className="px-4 py-3 text-xs font-semibold text-neutral-300">
                        {row["Hora"]}
                      </td>

                      {/* Formato */}
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${isReel ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"}`}>
                          {row["Formato"]}
                        </span>
                      </td>

                      {/* Hook / Tema (Editable) */}
                      <td 
                        onClick={() => handleCellClick(idx, "Hook / Tema", row["Hook / Tema"])}
                        className="px-4 py-3 text-xs font-bold text-white cursor-pointer relative whitespace-pre-wrap"
                      >
                        {editingCell?.rowIndex === idx && editingCell.column === "Hook / Tema" ? (
                          <textarea
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleSaveCell(idx, "Hook / Tema")}
                            onKeyDown={e => {
                              if (e.key === "Enter" && e.ctrlKey) {
                                e.preventDefault();
                                handleSaveCell(idx, "Hook / Tema");
                              } else if (e.key === "Escape") {
                                setEditingCell(null);
                              }
                            }}
                            className="absolute inset-0 w-full h-full bg-neutral-900 text-white font-bold p-2 text-xs border border-indigo-500 rounded outline-none z-10 resize-y"
                            autoFocus
                          />
                        ) : (
                          <span className="group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                            {row["Hook / Tema"] || <span className="text-neutral-700 italic">Clic para editar...</span>}
                          </span>
                        )}
                      </td>

                      {/* Copy Sugerido (Editable) */}
                      <td 
                        onClick={() => handleCellClick(idx, "Copy Sugerido", row["Copy Sugerido"])}
                        className="px-4 py-3 text-xs text-neutral-300 cursor-pointer relative whitespace-pre-wrap"
                      >
                        {editingCell?.rowIndex === idx && editingCell.column === "Copy Sugerido" ? (
                          <textarea
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleSaveCell(idx, "Copy Sugerido")}
                            onKeyDown={e => {
                              if (e.key === "Enter" && e.ctrlKey) {
                                e.preventDefault();
                                handleSaveCell(idx, "Copy Sugerido");
                              } else if (e.key === "Escape") {
                                setEditingCell(null);
                              }
                            }}
                            className="absolute inset-0 w-full h-full bg-neutral-900 text-white p-2 text-xs border border-indigo-500 rounded outline-none z-10 resize-y"
                            autoFocus
                          />
                        ) : (
                          <span className="group-hover:text-indigo-300 transition-colors">
                            {row["Copy Sugerido"] || <span className="text-neutral-700 italic">Clic para editar...</span>}
                          </span>
                        )}
                      </td>

                      {/* Guion Grabación (Editable) */}
                      <td 
                        onClick={() => handleCellClick(idx, "Guion Grabación", row["Guion Grabación"] || "")}
                        className="px-4 py-3 text-xs text-neutral-200 cursor-pointer relative whitespace-pre-wrap font-mono"
                      >
                        {editingCell?.rowIndex === idx && editingCell.column === "Guion Grabación" ? (
                          <textarea
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleSaveCell(idx, "Guion Grabación")}
                            onKeyDown={e => {
                              if (e.key === "Enter" && e.ctrlKey) {
                                e.preventDefault();
                                handleSaveCell(idx, "Guion Grabación");
                              } else if (e.key === "Escape") {
                                setEditingCell(null);
                              }
                            }}
                            className="absolute inset-0 w-full h-full bg-neutral-900 text-white p-2 text-xs border border-indigo-500 rounded outline-none z-10 resize-y"
                            autoFocus
                          />
                        ) : (
                          <span className="group-hover:text-indigo-300 transition-colors">
                            {row["Guion Grabación"] || <span className="text-neutral-700 italic">Clic para agregar guion...</span>}
                          </span>
                        )}
                      </td>

                      {/* SEO Keywords (Editable) */}
                      <td 
                        onClick={() => handleCellClick(idx, "SEO Keywords", row["SEO Keywords"] || "")}
                        className="px-4 py-3 text-xs text-indigo-400 cursor-pointer relative whitespace-pre-wrap"
                      >
                        {editingCell?.rowIndex === idx && editingCell.column === "SEO Keywords" ? (
                          <textarea
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleSaveCell(idx, "SEO Keywords")}
                            onKeyDown={e => {
                              if (e.key === "Enter" && e.ctrlKey) {
                                e.preventDefault();
                                handleSaveCell(idx, "SEO Keywords");
                              } else if (e.key === "Escape") {
                                setEditingCell(null);
                              }
                            }}
                            className="absolute inset-0 w-full h-full bg-neutral-900 text-white p-2 text-xs border border-indigo-500 rounded outline-none z-10 resize-y"
                            autoFocus
                          />
                        ) : (
                          <span className="group-hover:text-indigo-300 transition-colors">
                            {row["SEO Keywords"] || <span className="text-neutral-700 italic">Agregar keywords...</span>}
                          </span>
                        )}
                      </td>

                      {/* CTA */}
                      <td className="px-4 py-3 text-xs font-semibold text-neutral-400">
                        {row["CTA"] || "-"}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                          ) : (
                            <button
                              onClick={() => setSelectedRow(row)}
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-indigo-500/20 text-neutral-400 hover:text-indigo-400 transition-all"
                              title="Ver en Teleprompter"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Panel Lateral: Teleprompter / Lector de Guiones ── */}
      {selectedRow && (
        <div className="w-96 bg-black/60 border border-neutral-800 rounded-3xl flex flex-col overflow-hidden backdrop-blur-xl p-6 shadow-2xl shrink-0">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4 shrink-0">
            <div>
              <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">Teleprompter Activo</span>
              <h2 className="text-sm font-black text-white mt-1">
                {selectedRow["Día"]} · {selectedRow["Formato"]}
              </h2>
            </div>
            <button 
              onClick={() => setSelectedRow(null)}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all"
            >
              ✕
            </button>
          </div>

          {/* Selector de tamaño de letra para legibilidad */}
          <div className="flex items-center justify-between bg-neutral-900/60 p-3 rounded-2xl mb-4 shrink-0 border border-neutral-800/50">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tamaño de Letra</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFontSize(prev => Math.max(16, prev - 4))} 
                className="w-7 h-7 flex items-center justify-center bg-neutral-800 rounded-lg text-xs font-black hover:bg-neutral-700 active:scale-95"
              >
                A-
              </button>
              <span className="text-xs font-bold w-6 text-center">{fontSize}</span>
              <button 
                onClick={() => setFontSize(prev => Math.min(48, prev + 4))} 
                className="w-7 h-7 flex items-center justify-center bg-neutral-800 rounded-lg text-xs font-black hover:bg-neutral-700 active:scale-95"
              >
                A+
              </button>
            </div>
          </div>

          {/* Contenido en tamaño gigante */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            <div className="space-y-6">
              
              {/* Hook */}
              <div>
                <span className="text-[9px] font-black text-red-400 tracking-widest uppercase block mb-1">Gancho / Hook (0-8s):</span>
                <p 
                  className="font-black text-white leading-tight"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {selectedRow["Hook / Tema"]}
                </p>
              </div>

              {/* Guion de Grabación o Copy */}
              <div>
                <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase block mb-1">
                  {selectedRow["Guion Grabación"] ? "Guion de Grabación Escena por Escena:" : "Copy / Locución sugerida:"}
                </span>
                <p 
                  className="font-bold text-neutral-200 leading-snug whitespace-pre-wrap font-mono"
                  style={{ fontSize: `${fontSize - 2}px` }}
                >
                  {selectedRow["Guion Grabación"] || selectedRow["Copy Sugerido"]}
                </p>
              </div>

              {/* Descripción Visual */}
              {selectedRow["Descripción Visual"] && (
                <div className="bg-neutral-900/40 border border-neutral-800/40 p-4 rounded-2xl">
                  <span className="text-[9px] font-black text-neutral-500 tracking-widest uppercase block mb-1">Descripción Visual / B-Roll:</span>
                  <p className="text-xs font-bold text-neutral-400 leading-relaxed whitespace-pre-wrap">
                    {selectedRow["Descripción Visual"]}
                  </p>
                </div>
              )}

              {/* Keywords SEO */}
              {selectedRow["SEO Keywords"] && selectedRow["SEO Keywords"] !== "-" && (
                <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-2xl">
                  <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase block mb-1">Keywords SEO (Control):</span>
                  <p className="text-xs font-bold text-indigo-300 leading-relaxed">
                    {selectedRow["SEO Keywords"]}
                  </p>
                </div>
              )}

              {/* CTA */}
              {selectedRow["CTA"] && selectedRow["CTA"] !== "-" && (
                <div className="border-t border-neutral-800 pt-4">
                  <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase block mb-1">Acción / CTA (ManyChat):</span>
                  <span className="inline-block px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-black text-emerald-400">
                    {selectedRow["CTA"]}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
