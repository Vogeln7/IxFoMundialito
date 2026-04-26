import { useState, useEffect, useCallback, useRef } from "react";

/* ══════════════════════════════════════════════════════════════
   DATOS FIJOS
══════════════════════════════════════════════════════════════ */
const EQUIPOS_FIFA_2026 = [
  { nombre: "Argentina",        b: "🇦🇷", iso: "ar", conf: "CONMEBOL" },
  { nombre: "Brasil",           b: "🇧🇷", iso: "br", conf: "CONMEBOL" },
  { nombre: "Colombia",         b: "🇨🇴", iso: "co", conf: "CONMEBOL" },
  { nombre: "Ecuador",          b: "🇪🇨", iso: "ec", conf: "CONMEBOL" },
  { nombre: "Uruguay",          b: "🇺🇾", iso: "uy", conf: "CONMEBOL" },
  { nombre: "Venezuela",        b: "🇻🇪", iso: "ve", conf: "CONMEBOL" },
  { nombre: "Chile",            b: "🇨🇱", iso: "cl", conf: "CONMEBOL" },
  { nombre: "Paraguay",         b: "🇵🇾", iso: "py", conf: "CONMEBOL" },
  { nombre: "Bolivia",          b: "🇧🇴", iso: "bo", conf: "CONMEBOL" },
  { nombre: "Perú",             b: "🇵🇪", iso: "pe", conf: "CONMEBOL" },
  { nombre: "Estados Unidos",   b: "🇺🇸", iso: "us", conf: "CONCACAF" },
  { nombre: "México",           b: "🇲🇽", iso: "mx", conf: "CONCACAF" },
  { nombre: "Canadá",           b: "🇨🇦", iso: "ca", conf: "CONCACAF" },
  { nombre: "Costa Rica",       b: "🇨🇷", iso: "cr", conf: "CONCACAF" },
  { nombre: "Panamá",           b: "🇵🇦", iso: "pa", conf: "CONCACAF" },
  { nombre: "Jamaica",          b: "🇯🇲", iso: "jm", conf: "CONCACAF" },
  { nombre: "Honduras",         b: "🇭🇳", iso: "hn", conf: "CONCACAF" },
  { nombre: "Guatemala",        b: "🇬🇹", iso: "gt", conf: "CONCACAF" },
  { nombre: "Trinidad y Tobago",b: "🇹🇹", iso: "tt", conf: "CONCACAF" },
  { nombre: "Francia",          b: "🇫🇷", iso: "fr", conf: "UEFA" },
  { nombre: "España",           b: "🇪🇸", iso: "es", conf: "UEFA" },
  { nombre: "Alemania",         b: "🇩🇪", iso: "de", conf: "UEFA" },
  { nombre: "Portugal",         b: "🇵🇹", iso: "pt", conf: "UEFA" },
  { nombre: "Inglaterra",       b: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", iso: "gb-eng", conf: "UEFA" },
  { nombre: "Italia",           b: "🇮🇹", iso: "it", conf: "UEFA" },
  { nombre: "Países Bajos",     b: "🇳🇱", iso: "nl", conf: "UEFA" },
  { nombre: "Croacia",          b: "🇭🇷", iso: "hr", conf: "UEFA" },
  { nombre: "Bélgica",          b: "🇧🇪", iso: "be", conf: "UEFA" },
  { nombre: "Polonia",          b: "🇵🇱", iso: "pl", conf: "UEFA" },
  { nombre: "Suiza",            b: "🇨🇭", iso: "ch", conf: "UEFA" },
  { nombre: "Serbia",           b: "🇷🇸", iso: "rs", conf: "UEFA" },
  { nombre: "Dinamarca",        b: "🇩🇰", iso: "dk", conf: "UEFA" },
  { nombre: "Austria",          b: "🇦🇹", iso: "at", conf: "UEFA" },
  { nombre: "Turquía",          b: "🇹🇷", iso: "tr", conf: "UEFA" },
  { nombre: "República Checa",  b: "🇨🇿", iso: "cz", conf: "UEFA" },
  { nombre: "Escocia",          b: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", iso: "gb-sct", conf: "UEFA" },
  { nombre: "Hungría",          b: "🇭🇺", iso: "hu", conf: "UEFA" },
  { nombre: "Eslovaquia",       b: "🇸🇰", iso: "sk", conf: "UEFA" },
  { nombre: "Eslovenia",        b: "🇸🇮", iso: "si", conf: "UEFA" },
  { nombre: "Marruecos",        b: "🇲🇦", iso: "ma", conf: "CAF" },
  { nombre: "Nigeria",          b: "🇳🇬", iso: "ng", conf: "CAF" },
  { nombre: "Senegal",          b: "🇸🇳", iso: "sn", conf: "CAF" },
  { nombre: "Camerún",          b: "🇨🇲", iso: "cm", conf: "CAF" },
  { nombre: "Ghana",            b: "🇬🇭", iso: "gh", conf: "CAF" },
  { nombre: "Egipto",           b: "🇪🇬", iso: "eg", conf: "CAF" },
  { nombre: "Japón",            b: "🇯🇵", iso: "jp", conf: "AFC" },
  { nombre: "Corea del Sur",    b: "🇰🇷", iso: "kr", conf: "AFC" },
  { nombre: "Arabia Saudita",   b: "🇸🇦", iso: "sa", conf: "AFC" },
  { nombre: "Irán",             b: "🇮🇷", iso: "ir", conf: "AFC" },
  { nombre: "Australia",        b: "🇦🇺", iso: "au", conf: "AFC" },
  { nombre: "Uzbekistán",       b: "🇺🇿", iso: "uz", conf: "AFC" },
  { nombre: "Qatar",            b: "🇶🇦", iso: "qa", conf: "AFC" },
  { nombre: "Iraq",             b: "🇮🇶", iso: "iq", conf: "AFC" },
  { nombre: "Nueva Zelanda",    b: "🇳🇿", iso: "nz", conf: "OFC" },
];

// Renderiza la bandera como imagen (funciona en Windows donde los emojis de banderas no se muestran)
function FlagImg({ iso, size = 32, style = {} }) {
  const [err, setErr] = useState(false);
  if (!iso) return <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>⚽</span>;

  // ISO mapping para circle-flags (usa códigos ISO 3166-1 alpha-2)
  // gb-eng y gb-sct necesitan tratamiento especial
  const src = iso === "gb-eng"
    ? "https://hatscripts.github.io/circle-flags/flags/gb-eng.svg"
    : iso === "gb-sct"
    ? "https://hatscripts.github.io/circle-flags/flags/gb-sct.svg"
    : `https://hatscripts.github.io/circle-flags/flags/${iso.toLowerCase()}.svg`;

  if (err) {
    // Fallback: código ISO en texto con fondo si no carga la imagen
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, borderRadius: "50%",
        background: "rgba(0,154,222,.2)", border: "1px solid rgba(0,154,222,.4)",
        fontFamily: "var(--fd)", fontSize: size * 0.35, fontWeight: 900,
        color: "var(--ixfo-blue)", letterSpacing: 0, ...style
      }}>
        {iso.toUpperCase().slice(0,2)}
      </span>
    );
  }

  return (
    <img
      src={src}
      width={size} height={size}
      alt={iso}
      style={{ borderRadius: "50%", display: "inline-block", objectFit: "cover", ...style }}
      onError={() => setErr(true)}
    />
  );
}


// Partido: p1/p2=IDs jugadores, g=ID ganador
// s1/s2=goles normales, et=resultado prórroga ("p1"|"p2"|null), pen=resultado penales ("p1"|"p2"|null)
const mkMatch = () => ({ p1: null, p2: null, g: null, s1: "", s2: "", et: null, pen: null });
const mkBracket = (gf = false) => gf
  ? { cuartos: Array(4).fill(null).map(mkMatch), semis: Array(2).fill(null).map(mkMatch), final: [mkMatch()] }
  : { octavos: Array(8).fill(null).map(mkMatch), cuartos: Array(4).fill(null).map(mkMatch), semis: Array(2).fill(null).map(mkMatch), final: [mkMatch()] };

const TORNEOS_BASE = [
  { id: 1, nombre: "Clasificatorio #1", fecha: "Lunes 4 de Mayo", sede: "Posadas", direccionSede: "", estado: "pendiente", titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket() },
  { id: 2, nombre: "Clasificatorio #2", fecha: "Martes 5 de Mayo", sede: "Garupá", direccionSede: "", estado: "pendiente", titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket() },
  { id: 3, nombre: "Clasificatorio #3", fecha: "Miércoles 6 de Mayo", sede: "Posadas", direccionSede: "", estado: "pendiente", titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket() },
  { id: 4, nombre: "Clasificatorio #4", fecha: "Jueves 7 de Mayo", sede: "Garupá", direccionSede: "", estado: "pendiente", titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket() },
  { id: 5, nombre: "Clasificatorio #5", fecha: "Lunes 11 de Mayo", sede: "Posadas", direccionSede: "", estado: "pendiente", titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket() },
  { id: 6, nombre: "Clasificatorio #6", fecha: "Martes 12 de Mayo", sede: "Garupá", direccionSede: "", estado: "pendiente", titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket() },
  { id: 7, nombre: "Clasificatorio #7", fecha: "Miércoles 13 de Mayo", sede: "Posadas", direccionSede: "", estado: "pendiente", titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket() },
  { id: 8, nombre: "Clasificatorio #8", fecha: "Jueves 14 de Mayo", sede: "Garupá", direccionSede: "", estado: "pendiente", titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket() },
  { id: 9, nombre: "GRAN FINAL", fecha: "Sábado 6 de Junio", sede: "Posadas", direccionSede: "", estado: "pendiente", titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket(true), isGranFinal: true },
];


const DISCLAIMER_TEXT = "Este torneo no está afiliado ni patrocinado por Electronic Arts Inc. o sus licenciantes.";
const CFG_DEFAULT = {
  empresa: "IXFO Internet por Fibra Óptica", evento: "Mundialito IXFO 2026",
  tagline: "El torneo de fútbol virtual más grande de Misiones",
  logoUrl: "", whatsapp: "+54 9 376 000-0000",
  instagram: "@ixfo.misiones", facebook: "IXFO Misiones",
  adminPassword: "IXFO2026",
  operatorPassword: "OPERADOR2026",
  modoLive: false,
  // SMTP
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "mundialito_ixfo@ixfo.com.ar",
  smtpPass: "",
  smtpFrom: "mundialito_ixfo@ixfo.com.ar",
  smtpFromName: "Mundialito IXFO 2026",
};

const IXFO_LOGO_B64 = "data:image/png;base64,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";

const ANEXO1_PDF_B64 = "data:application/pdf;base64,JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSIC9GMiAzIDAgUiAvRjMgNCAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL0Jhc2VGb250IC9IZWx2ZXRpY2EgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YxIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKMyAwIG9iago8PAovQmFzZUZvbnQgL0hlbHZldGljYS1Cb2xkIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMiAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0Jhc2VGb250IC9aYXBmRGluZ2JhdHMgL05hbWUgL0YzIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKNSAwIG9iago8PAovQ29udGVudHMgMTAgMCBSIC9NZWRpYUJveCBbIDAgMCA1OTUuMjc1NiA4NDEuODg5OCBdIC9QYXJlbnQgOSAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNiAwIG9iago8PAovQ29udGVudHMgMTEgMCBSIC9NZWRpYUJveCBbIDAgMCA1OTUuMjc1NiA4NDEuODg5OCBdIC9QYXJlbnQgOSAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNyAwIG9iago8PAovUGFnZU1vZGUgL1VzZU5vbmUgL1BhZ2VzIDkgMCBSIC9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9BdXRob3IgKFwoYW5vbnltb3VzXCkpIC9DcmVhdGlvbkRhdGUgKEQ6MjAyNjA0MjIxMzMxNTQrMDAnMDAnKSAvQ3JlYXRvciAoXCh1bnNwZWNpZmllZFwpKSAvS2V5d29yZHMgKCkgL01vZERhdGUgKEQ6MjAyNjA0MjIxMzMxNTQrMDAnMDAnKSAvUHJvZHVjZXIgKFJlcG9ydExhYiBQREYgTGlicmFyeSAtIFwob3BlbnNvdXJjZVwpKSAKICAvU3ViamVjdCAoXCh1bnNwZWNpZmllZFwpKSAvVGl0bGUgKFwoYW5vbnltb3VzXCkpIC9UcmFwcGVkIC9GYWxzZQo+PgplbmRvYmoKOSAwIG9iago8PAovQ291bnQgMiAvS2lkcyBbIDUgMCBSIDYgMCBSIF0gL1R5cGUgL1BhZ2VzCj4+CmVuZG9iagoxMCAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCAyMjU0Cj4+CnN0cmVhbQpHYiIvJz5Ba0VNJ1JvZVszMC5xazpaZkMnR3A8TXA8KldbZVVVSUhCWF5VVTVbMjYsNmRSPScoNFlxRz1BSz9yLFVebUo0Xy9hL000NVpQaSIsXyMvNThRJmlYI1tpJkBfYXRJKytRcCxANlQ6WnI5VzVXImk6RVZOVzo5InEjXTcwPWI9ZzphITZJJylPLi0qR0VgPFZNOXFiWyg7UmhvMVBROjluRi9CPVFQPlY1JmtUVEJUKF0wQWspSWUpJWdPRjQqXnQxJSNHOD0oXSZZLERsO0NBOlBuKSNKMyQ3JFFxU1YwJzMxbihXTy9qXktiNFJEQXJ1OitITVkwRzdmNTBiUV06dDxITEl0ZywuYj82cDwoQk1LUXI4OSRnJjZdSi1ITT9YIjA0ODJYNy89RWlEKz9zZzRUaktFR2QuXlssc1t0K0JNRm5jIU1ib1hsNzI1O0cyRyI1Nl9UcDxtckdLX29sWCUsLjh1b1AyTXJITDJiMkRMPkkqO0ImUCtlJmAqZ0cmbTR0LmdjLmpRLzZLZUZKQUtaQG1TWzgtWSkyPkBeITNiTEtPZy1QaWhIWVMkaC0zdWYjPzNBcGJYSHFeIUZRL3M0Vm9sNmBgMWkkZm0+WSdwZ1gzaSFvZSguWS8nc0RMZVUnK1VxMV5HQWNnUkwsWy4hQltrNjNiYTFsSm08Z3I2cm1lViNSWDpYQUZgNWhlKzduSVFuQEYhTjZHTS9ZQ2MrM11RJi0vPkFdVFwpPzQiIyhKRlIjJlNJS0g6XkNMK1JJWURRPVo1XS8oZTFSbU9yPCtdL0xQOGRNKVIrL29jVTxYMWVwKlo4NlUobzpDImwnMEclSTlHanUuZDFwamFSJ21KK29sZj4+QDVPSWhBYENAYTk2UydFVV5lKEFcMi9PT09lKFIuYlk7PXE8bUxJKmwhLlErND1MQXRyal5pMUJxbkhMdWxXLFk7NkkjSk1zJWtEYWwhOTslPiNVOGMpZ0JcXDQ4I25JTHF0RXFmbiRfR3VAMkFgamNFSVdYRkwiPkdTOE9IOWtwIjQsLFBbMSlbSUgmWl8oOWhpciMjMCROQUZvPCkyPVojPEkvRlAtb0csUVFSSGRFPUdzRy9dPEBwWmwuaGUyNmlqQChoQj87I05EMmZrRS9ALSYjRTN1UCdKLzY8UXUjRF1aSycsYGZiXi9sYTVOVEdYSm9EMSo5LzY7bnJTU1RUKGRVJ1dIIVwqb19RJEFiUycrW2ZALmk5bid1KWoiQSE4Lz4pPDk0Q01uPDReR3NzQmF0VG9dOTtLVFk4IyhAWjBDdUtfJVszSEFYQl9wSyR1ZGE+V29WJzVjblMsUEhWPkclVHNrQictc1dXJnBJSnQ2XykqQVg8PTNSLy46aDlNSWVXUjsiQSItQC4pPz1wbnRoJ1BgVFRLLyNLXiNWODFSMzwvPkQsNCRObmA2bmlMcERUKyMuS2EjM2ZbRUZuXXJFODVsRSooako8JlwpcC9FQkw+I142Qy5nQW9SMGUnNG5COUtNb3AkKW4jJTU1MEBAPEkwYiZQNGdAKU9tW2JyMGJYOl1LP1gvR1locmkqZktJXCpScGZxRHMtVCFDTUx1YUhuJjg6KU9UYUJpbVBJI11AWkZOTzkwRkFtIlcuaEcoO1BiVW88NGxlQVs9SW0hSlEnTDQ+Njk0OlpxRGopPHVsWTFjbjdHQUU2TVFPNltNODFuMi03b1pxTC5OMVNvcFFoNEtmTVIxS01dW2Q4dD5KaCpRUDhxKC1NWShGVnNoYy0wXC9GcWZJZT1rXidTUkg1THFgb1VecGlRSz4/U0FGPzJmSDpmW1lwaXRGTjw6OVdiSFJlRmk0M0owTjRqPTlLLj9NTyoqNk9mKj4mNl9UakZNZmYiI24/JzAyaWdLQixRQm9eZTcwWE5IZFQobEc9YChoQVtNcy0sUmduVS5NMmFtJkxqVHRiSlpGQmZIL3VSYXFmbFQ/aFJHTjxUS1FISmRTSTM3YDY/b29FRFhROz0jIUJaQDEzPCIyXGo4ZWhELSNPUEg3P04ibiQxLHEhYExeWysnJiNdcSI2bFNHPTJQYzROJGYrTE8tWlpIOEAwQVZ0dFtTciRENDJbZjU6ZTQydU4xVi9gXm9tR2twXF5BNkJsIlNUUVlmbEpkVFI/LV9sQ3NvLnM6WC8/P0IsXEVBalFtc1hAIl0hXygtRCVUa1piVTEnZWE4XERtbl84XVNgcWtbQ1pcMCJdQXU6aCF1JCopb2xRakFZc2x1MV0vNkRUZz1jS0xjIWdyaycjYyFQMGYtZmlcNFhbX2A7OVVqQlQmUDA/Lz5EOWwlQUwyQU83MkEhIT8kXi8kczZbJjxnQ2YicEM7RS1NRl1ccVVbSjAkRTYuOF83Ij0oYidYUCdfLjhoSFdKLGJkJTolUT9EakZiaTRPaytKaEgyL1MqMVo4VyclbEhIQWFfbE1McVhAU1glJEU9RCVBJTNzbkklTlFuP1JgbTlobi5ZQmojWmBvc2cqcDBjOGwsbkM3ZEpdPFc4W1dbXyxUQlxgSzktc0kpOSckN1skbCxxTEswRzw7X3VLYGI9T1VqYTgtdCM2P0p0KUBqU0lIMHBmYSNPO2dIJTFbSEVoOyo6WGQlJGhGSmNxVTlGPUFZNGZmNSE7XGVZSl0iOSMxQEFiJ2QmQFA4Lj1yO1dYIUdiLjlMQ09RQT11a2RoLSRXKSUoOm45NStwP0NDYTJLbl5wWE1mTWo3XSEsY1lQMTEpV3EmImtIbGZpNkJTJzIqakA7cDFlXC4lZC1ecTVJJSxWVy5ib090bSokcWQzZipIX29mKWNqRV0salFqXD8zQVlZPEZBa09aKDwkWilsbm4wP3MoNkNmNSIwLm8pYFFDUGZtbFNAcko4QjQ2Kk5XVzFldV1sTEhbM2pWZWQhRCoiXj5OdFtPS2V1SFAqZSondW5sYDZZWWlHQDxIcVVtK3VeYCgqbD0kTFp0KyYwYXU1bH4+ZW5kc3RyZWFtCmVuZG9iagoxMSAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCA5MDYKPj4Kc3RyZWFtCkdhdFUwZ01ZXzEmOk5ebGspaS10QigsJ1EpY10zbidxMXFAWCQuWStOY0QhQlljLlpyVTQuSyZmOEZMJVA9PmxwKD4oRVVjQz9tViRuLEgraHBXPVVnREo1VSRsRmNwJVtcTFNpXy1lOyM8ckQsI1QkL08hQ1RRUyIwMD41XmJmT1A7Oz5oXTxZOTU2IzBpIk9TM3JSWGg4dDFVIVlsTE5kbCZMPzJDWGYuYE42TEJOazciIW9BUks8a0cqaENJLjAtKGUwUUpiQy4oKUA8I1VRbzBWIVVrRSc+LkY6PyFka0hsWlBwVmQtdWdwYEFGWU9STiUpKjM9IVJZdCYodS0nPWxOTT84TC9QWjM7YkZdP05EOlBzIWkoImpBUkFIaCxsW1JzcFNcNipcQDIhTk08PCg1TVUrY29OclctaGpiLURKV0AsU0YhSmg1X1YiNl43JzMkMiY4aWJUTEVRZFx0NjlQcVtiLGs4SGglRC0+dE1PdS9kOy9JR1QtZlxBOzZhc3UvXTRHL1E7MS1fIzMia1VbckZUZC5WJzlYczwrb3IyQyhaN3FlRCQnPkhULldMXWdGP1BPTzZtLjJcLUZzVzZzO0FRPXQ6ND9MQXBqKFY2cydGLVdCSVJyaWdIY1QtQk1wO11Wb29qTyhzI0VtKzxyPXIoQFBNYypfVCwiKVNRNGBnJUFqMSQsIm88dGNeUk5qZilnYiJacklgIi08XkYqcTApU2JPNiRYbmlsNjYxImFJYCdMIl5FKEdJZFJDKEhMdTo3cjxfajxDNyRDRUlvZUk7WEZHViVJSVhJL0xhKSdWbXBWKlIlYSouVkouNm0/YS5EOz87JE9YKSE0VW5hUzU/bCImRENrL1pkSTowQigxdSlAOFRdbFI2NiU0LVoqWUhMLE1pLXFlUFxscWpEImhGX0YuL0lyVyRYPSROXiVWR05ebUltQ3Vzcz1QWkhiMU1hJmM2L3ReWFRhcktqL0ZnVmYmUmVASHBGKVZnJDJXSV5taicoa1wnY2lnZ2k2IWk7LUZscU1laUYzby5vLihaPTckKVtTMVNeLltjWHJwQDBBT1hwPy9yZ3FmUGU2ZWpITnItLm5iOzpBZzVWdGlBLGg3QzNOMnAiMjhTQUksP2pDT0hqOkE0dFJiUkhuZ049SkovIWlbQ21mdFckXVxLc15bPnQ1JTRfVmNMSk8wNCR+PmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDEyCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA2MSAwMDAwMCBuIAowMDAwMDAwMTEyIDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKMDAwMDAwMDMzMSAwMDAwMCBuIAowMDAwMDAwNDE0IDAwMDAwIG4gCjAwMDAwMDA2MTggMDAwMDAgbiAKMDAwMDAwMDgyMiAwMDAwMCBuIAowMDAwMDAwODkwIDAwMDAwIG4gCjAwMDAwMDExNzAgMDAwMDAgbiAKMDAwMDAwMTIzNSAwMDAwMCBuIAowMDAwMDAzNTgxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL0lEIApbPGY5ZDkwNmI0MmRlZWJiZTM1ZmZhYWExM2E2NmM5MDc0PjxmOWQ5MDZiNDJkZWViYmUzNWZmYWFhMTNhNjZjOTA3ND5dCiUgUmVwb3J0TGFiIGdlbmVyYXRlZCBQREYgZG9jdW1lbnQgLS0gZGlnZXN0IChvcGVuc291cmNlKQoKL0luZm8gOCAwIFIKL1Jvb3QgNyAwIFIKL1NpemUgMTIKPj4Kc3RhcnR4cmVmCjQ1NzgKJSVFT0YK";
const ANEXO2_PDF_B64 = "data:application/pdf;base64,JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSIC9GMiAzIDAgUiAvRjMgNSAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL0Jhc2VGb250IC9IZWx2ZXRpY2EgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YxIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKMyAwIG9iago8PAovQmFzZUZvbnQgL0hlbHZldGljYS1Cb2xkIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMiAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0NvbnRlbnRzIDEwIDAgUiAvTWVkaWFCb3ggWyAwIDAgNTk1LjI3NTYgODQxLjg4OTggXSAvUGFyZW50IDkgMCBSIC9SZXNvdXJjZXMgPDwKL0ZvbnQgMSAwIFIgL1Byb2NTZXQgWyAvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJIF0KPj4gL1JvdGF0ZSAwIC9UcmFucyA8PAoKPj4gCiAgL1R5cGUgL1BhZ2UKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0Jhc2VGb250IC9aYXBmRGluZ2JhdHMgL05hbWUgL0YzIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKNiAwIG9iago8PAovQ29udGVudHMgMTEgMCBSIC9NZWRpYUJveCBbIDAgMCA1OTUuMjc1NiA4NDEuODg5OCBdIC9QYXJlbnQgOSAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNyAwIG9iago8PAovUGFnZU1vZGUgL1VzZU5vbmUgL1BhZ2VzIDkgMCBSIC9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9BdXRob3IgKFwoYW5vbnltb3VzXCkpIC9DcmVhdGlvbkRhdGUgKEQ6MjAyNjA0MjIxMzMxNTQrMDAnMDAnKSAvQ3JlYXRvciAoXCh1bnNwZWNpZmllZFwpKSAvS2V5d29yZHMgKCkgL01vZERhdGUgKEQ6MjAyNjA0MjIxMzMxNTQrMDAnMDAnKSAvUHJvZHVjZXIgKFJlcG9ydExhYiBQREYgTGlicmFyeSAtIFwob3BlbnNvdXJjZVwpKSAKICAvU3ViamVjdCAoXCh1bnNwZWNpZmllZFwpKSAvVGl0bGUgKFwoYW5vbnltb3VzXCkpIC9UcmFwcGVkIC9GYWxzZQo+PgplbmRvYmoKOSAwIG9iago8PAovQ291bnQgMiAvS2lkcyBbIDQgMCBSIDYgMCBSIF0gL1R5cGUgL1BhZ2VzCj4+CmVuZG9iagoxMCAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCAyNTc0Cj4+CnN0cmVhbQpHYiEjXENOJXQ7JyllRC8xJEMhL2lOUl1jSEwqUjpFPStALjQ0ZD5laDFeQ2ZgTTEkc0FCQyt0Wm1rXmhoXVg7aG4ncCNwPmhmSWRyInRTUUxNKDMvYWFpQThaYGhnXV5mOkxaREFiLDxkMHVDMCovTyRVKEw7RiFUS3AicF9AbzBTYTFRdDRJWmBTQ2NPNVFpU2RSPDhLUjssTlFQOD11JVldTWYwLEckJTpfRFZ1XGYmcHVbUjIlTyxuJk0kKkZvKXJnQThePCQxIVd0RFc7N1ZjUGtDVTo/bk46amItUlFLNGs6Vl87ayReKzVaW2MmYkxSZio8RShuSTFPXzxMamonWFJsR2dQRDokUmMwdE9jbmA6cDUmclBqUDcuN1khdGprYG1ZcmRJbkksI100LW8pYGgmO1w/bzhFM1pNOjF1O0YxLGA2XHJLZzpFQDhZKz8qWzIvLUg6NDIkMU5kREkpInMvbWJkVD1mNWMiOCNDQ2RTT2NvZHRySisiIU1pJj9gJUdkLDNsX1NkOEQuTz01PylGN1xUS2lqbTRDbjEiQUkwLzFUZDpQSUxrSCpgTihKakFiK0YkQzZIUypNVXAkaHRcIVA6Rl5lT14lYEFEOlgxZEZMbzU+cyRCSmhQUFwmY1QlUDZZMSQlbTMiMlMvbic6ZHAiUl9rbjJyM1IxMWxdYSg3MUA+Z3FLSkE4cTctY1FHTlZlM1tmNnQhZTZiKUJzajIyLUVDTmhGVSM/XkdVXT5xazlFKTY4TUByTGFASWg3KHElPDdTJEomMzldKiJCJ2o+RnQ2N1QoXkE7aks8LiEtNDNZWEZwciorW04qMVYhYExSYGBzL1JxZDtjMWVyJUxWb0dBVV0sYmhtVCZfY0pcakQncyY7Ky5FW0NKLnFcYFdHQjRCaVNpal5AWEFvN19yPCFxTllIKGhtUyEyW005SkZdOXIqRz5TLTdHVlkyYEBxW3VfZ2I5ZW1wS1lyNC40VS50J09ZVWliUVlcXEY/Yj1cZkRiI0xHUm9UT2t1Iz0kMUAnJi1kTj1cUzAvZ0QpY180MUdnQTs/KzRXKnRHJlBvQ0xbZWNGXzNxMCZSL0VdTkUrVjU8LVg5S1RlVV9rcGlhbjZIQVQkYGdpS0JMc0o2UDNwKDlsP0d0QWQ9N1E3cz8tJzhwYltXVyZeK1AwKGVUZmApaS1tTTtnXSNfX1spTU1VPm42VmxfSXNHXV1GMURsXDAoR2QlXWhCQzg5KkohTVI4PkloQkpiclxoJyxJU1dHbkQuOSJSZ3BGXiFiOG4jOGZRWytgdVVzY28vO1U8VD88MnRVZCtzXFpTM201XVJHOkxtOFtgQlJOYD40WiUkWGVZMV8iN0pAW2RaKipfP2MrJ0lkOUZ0P09uaiZOZ0k4IihySyRzYGItOzZdUjdkcExtRE0pM2xsaCRhJCNyJDQ+T3FHRmVXb3QmTnJlJzxGTGp1MllFI1ssODtmYDUqZVgvWEpXU21tUiE8KVJFOEw5QXRtSFVIK0xqJ000WF4zX11tK1dMUF1ob2hmS1UyTDxqWTQ6SEYyJSZDYEotVTU6QTNuNVZWb0A6Iz5MNUp1cEFLaEEzLD1aOyRWMmwpbiphYTglNG51ZD9cSCVKMVdFOzxQbTNDMignOyo8V2UyaSQmW14ubSdWV0xyNClAMS1bZV47Lyo5bHJJQ29ZK0FOU2VURzFJY3JqTjlDL3Q6S0Y4ayElYyRQNGo+NSJyVCkkZjA1Ny10J1U2Wm1BWTpzTVkqQ11lcWozLmFEP0c5JTBzSFxdcylfMClsTFZTXTIiR0ZPXWskKGJPdFA3R1dETmNFTk4/NjJkb1BlaEAsbDgoPHIubE1JbVptZllCTCVDaFUpPmFHJz5ULUcyXXAwY09KV0poRkg5PXJiXT5GdFVXX0xfcG9nTW9eMWwlc0RAZDk2NGtjLXQ7SSM7QCQwOiIoPGdYMGMpQkJKIk9wWTApPGwiaU5xKm1dIz87WCViQSJ0NU1wXWFpMTItLk1VOHA/J1NdIk5KLE5VWyw8JTNnKVk8XWFMNmtmTGdbWms7Zi9EL1E2NSdMZ0Y8NSY9P0lQK0xKcU9RQUdeSjE/bD5FRTkmVnFSbmNqS1hINjBsUC03XF5PaVBwQzVGXmBXOWdfMFRbPiFybkRHaUppYzJ1S1UuMlplYjNOPFpESUlGOl9cY2A1clleYkRTTHNDYzQ7OkYlZV9wWyZtcF1YUy4pMiFBcFdKOFk6QDVQW1Q0QT1FJjBfcUxcVlo1YmkhMzByYWdSPjomSTVXaD5AOjozOjlrQ2E+O0RnQypeJTczS0wiTTU0IktoKzUiLXF0LWcnbUJxRUg1KVdHSVNuXl43OkdXJVY7Y1kzPnUmLSZwWy0sRyZHMDFvUklTUUxtMzU5NFY7cCxbJmA1bFduKllwSyhzMDRcTllQO2pyZ2khZzoxZ0VoSFFWbm06TWkvSCNrJDZPMm5UYVxPYWUhJyM+PXBfbUxIa1FSWV5QUDQpJjhYWFRYXDgzaiNRXTEtPCVWJU1MVE8qSDB0PUdTXnBdPz5OISFDU11TJicvYXBuWFwiOkomJGFSMVEnbVpHbEleW1peWUFGTChqIidzIU9uSDkqPnQ3N3BoO2loZls9ZGM2U08nRXVyKikhY1w3c1UiNG9sK1BYWVBpV19NUWEzNkdaRSFPX2hOZTg/VDFmalkkIzJIP0M8clVxb0VVXyp0I2lUMmUkK10pI2tNUSgvXzdvOWwuSnU7X2dgIUhnTUlTNU9xcztzJk1xP14vLz5UY0g5Ik8+WkBMWDcuUjJqckliUEY8PFo3VDpsRCsnayNLallAbVMhYjhPPW02M3M1PnU+alt1R2pQQXFoVTEsJl43aDUqSG9mWE1ZJkpJLUxcPFYhR1hlXkFCXElmOmVaOl0jNS1QcCIxMmpLbiQyJWY6bEQvYDpfXSozcV9FKj0kT1xEa18saGRLSnQuKUZAJGk6TCpNcDBrLltkTDNtdD1RaEwybmMjZ1dnL0hLcmQ1V2toWiZMMkFkaVdmbTVCOzxpZWpPM01pVlJkUCg6RHFqXGteXihJMDtWQWZiSCVlRF9Ub1ZXYFd1c0U8MlVHcmZDQWckR2ZQT2IyOjMyajInJU5yLF1wIiV1RVNfVFJmRChydHEwcWhhZ1I5Mks6KD0tbk5CV28tMSxQWlw+TnRfWyMwZXMwJydSVjUrRUtIP2REcGt0bEReMyVOdDwrUD4vayg/clpUQShkViZjOTUkWC8nJiV1RSQrOCMpR1puJnE8XkRqZjRKYSw+LG5uO3FCbGxBP2psMnVXJD8jRXFdUilAQlAtMisobiRvUSVEUVEuP0JQTWw+QHEtPStmOTkiV2FPKjpqOkw0IyZUS05FQTFCSkxZa21EYXAyWE5CRFs1RnFvUmByfj5lbmRzdHJlYW0KZW5kb2JqCjExIDAgb2JqCjw8Ci9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXSAvTGVuZ3RoIDExNzQKPj4Kc3RyZWFtCkdiISNaZ01ZYjgmOk4vM2JiSClkbF5iXzBxa2JRO1R1KHVDUTgvNFkrSjojTUFLWypiLSkhbmxPNzJIKywqSiowIzdkMXBPREwmIzNITz4lRnE/WEgwbWtXNCEnZU1DM0NRMTZuTjAiVCdaPSlCOTBFJnRgLjg1T2RSbW4+cTEjJkJOSDAnR2VoSmJYIVVWXVc8WjxgRThMIkEmLkQxIV42PzsjNGQ7T0pVV0BfPGpgSXBdbj5qTEctQTAoLkY1VDAnKUFuakdNKkdhazJZZlxpX0pkSlMyYCNCUCNeVVxWTVJwPTR0PSJzTW1xP2Q/QWpwLV8iNmk8XFBwTjhxaFhEPVMvTk1fPE0sMFAqQ2VJXkc2OGkrdENPPUoyQGpubEYvZGxoTiomdU8/MVJEPCY3XF9VblZVbShPPShBWCgjOFVyIzBlXGg8bSg5TlgqT100ZjxaaHR0S1ZGLjJAWVhjci05OEdyLFA8QWU/XmhhM3IrVWgkU3FrRDp1LSZaUmxOUWJoIV9PRmlpczMqQ0MuYTlYKVk0cixBaU1QOF9RWUUpUkBpaU9YZHQ5Y2xGL2EsRGpUdTNDY04mMCdcWjpvZmwwPmsqSXBaZ1JAMF4vJy07VE4nQkVBZEFqV0ldNEVScShXIzhOKHJkdT9UXmY2RWciOlQiUWJQL2xyOWwpSCxMYHU4JDUnKkZHOFxtQiRtaWhtakVmQS4hT08/J0kkLW0sRnNuUEZcMGNoZkwoSWZGT1loPjtzRzpYWjpLM0deciotVk5LIlolYkowUTYlPkw5OFc1SVNZYU0zYD9hYUtSJnVdNjFVcmhcX3VFNFgpMmgwVz5SbWE9UzQxRi9FMitbRy5HXCdIQVY4YyxvSVMvUWsjMU1tRUVKaF1sXjVnPFVHNSVIcVxeOGxXZlZyQClKLUlRcjUncUMtW0FeV1wjZ3IlXjc8QCZtcjlEcyYnYCs1Umsvbl5JTktKZjh1QDdXaFpfYSxVWDE4aSgqUyxDQT9oYy1FMFtTaG9hLz9mUSlbQyZjQTtka1dZTSlGTl4lQGJHLGg3Yj0+TSE+UUsnNEFdZT5hbV9WbU1dOjksLFNIKTJLbz1eKyRacEsqLE07VVNnQFZNaTNQOCZnN0lRNU04cyYpNmsyXWU3NFNpOV41XlpZWihxUyZeJmVVXmNNPko/QSIuUW42ZltmYzg9NlUkOm1AV10hVEdaIkE1SmtddSJNaypocEkqRiVBWGlxNlMrWjBwLXNPczc7SS0wNmdZQ1dqPVo/XlRxY2NQL09lLWNiKWs1VlE3WWQtWFona01VMVRlVCsuND5yNFo4Y0BrbWxhM19ORlRqc2RBKGJuRW1yMiJZa05YWFcxV3VbMGsvWSlCKSs3NEdIVUlTQjFXKklgbD1ZKCZQMXVCKzJZKjhhVzlVNWl1V1VpcHMoc3JKM2lfSjMhNC9RJCRmSW5qYlEuPk9OY1BHMWwkVG05YFl0TEQpbUswUHQ+dXAlTm1cMTtkNWpEXD4oRFQhJlBkRHEuLjRCISJzIVdQMTxaK2g9ZTlaaHJeTWFbc2E4fj5lbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCAxMgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwNjEgMDAwMDAgbiAKMDAwMDAwMDExMiAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCjAwMDAwMDAzMzEgMDAwMDAgbiAKMDAwMDAwMDUzNSAwMDAwMCBuIAowMDAwMDAwNjE4IDAwMDAwIG4gCjAwMDAwMDA4MjIgMDAwMDAgbiAKMDAwMDAwMDg5MCAwMDAwMCBuIAowMDAwMDAxMTcwIDAwMDAwIG4gCjAwMDAwMDEyMzUgMDAwMDAgbiAKMDAwMDAwMzkwMSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9JRCAKWzxmMDg4MGVhMDFkMTdjY2NiZTVlOTFiOTM4YWYyNWUyYj48ZjA4ODBlYTAxZDE3Y2NjYmU1ZTkxYjkzOGFmMjVlMmI+XQolIFJlcG9ydExhYiBnZW5lcmF0ZWQgUERGIGRvY3VtZW50IC0tIGRpZ2VzdCAob3BlbnNvdXJjZSkKCi9JbmZvIDggMCBSCi9Sb290IDcgMCBSCi9TaXplIDEyCj4+CnN0YXJ0eHJlZgo1MTY3CiUlRU9GCg==";



/* ══════════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════════ */
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const uid = () => Math.random().toString(36).slice(2);
const dp = (o) => JSON.parse(JSON.stringify(o));

// ══════════════════════════════════════════════════════════════
//  API — Llamadas al backend Express
// ══════════════════════════════════════════════════════════════

const API = "/api";

async function apiGet(path) {
  try {
    const r = await fetch(API + path);
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  } catch(e) { console.error("apiGet", path, e); return null; }
}

async function apiPost(path, body) {
  try {
    const r = await fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  } catch(e) { console.error("apiPost", path, e); return null; }
}

async function apiPut(path, body) {
  try {
    const r = await fetch(API + path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  } catch(e) { console.error("apiPut", path, e); return null; }
}

async function apiDelete(path) {
  try {
    const r = await fetch(API + path, { method: "DELETE" });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  } catch(e) { console.error("apiDelete", path, e); return null; }
}

function getParticipant(participants, id) { return participants.find(p => p.id === id); }
function pName(p) { return p ? `${p.nombre} ${p.apellido}` : "TBD"; }

function propagateBracket(bracket, round, matchIdx, winnerId, gf) {
  const b = dp(bracket);
  b[round][matchIdx].g = winnerId;
  const rounds = gf ? ["cuartos", "semis", "final"] : ["octavos", "cuartos", "semis", "final"];
  const ri = rounds.indexOf(round);
  if (ri < rounds.length - 1) {
    const nr = rounds[ri + 1];
    const ni = Math.floor(matchIdx / 2);
    if (matchIdx % 2 === 0) b[nr][ni].p1 = winnerId;
    else b[nr][ni].p2 = winnerId;
  }
  return b;
}

function setupBracketPlayers(titulares) {
  // titulares is array of 16 IDs
  const b = mkBracket();
  for (let i = 0; i < 8; i++) {
    b.octavos[i].p1 = titulares[i * 2] || null;
    b.octavos[i].p2 = titulares[i * 2 + 1] || null;
  }
  return b;
}
function setupGFBracket(titulares) {
  const b = mkBracket(true);
  for (let i = 0; i < 4; i++) {
    b.cuartos[i].p1 = titulares[i * 2] || null;
    b.cuartos[i].p2 = titulares[i * 2 + 1] || null;
  }
  return b;
}

/* ══════════════════════════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Barlow:wght@300;400;500;600;700&display=swap');
:root{
  /* ── IXFO Brand Colors ── */
  --ixfo-navy:#003b71;    /* PANTONE 451C */
  --ixfo-blue:#009ade;    /* PANTONE 2925C */
  --ixfo-orange:#ff6700;  /* PANTONE 1655C */
  /* ── Backgrounds (dark navy) ── */
  --bg:#00101e;--bg2:#001830;--su:#002040;--su2:#002d58;
  --bo:#003b71;--bo2:#0051a0;
  /* ── Accents ── */
  --gr:#009ade;--gr2:#007bb5;   /* primary = IXFO blue */
  --go:#ff6700;--go2:#e05a00;   /* secondary = IXFO orange */
  --re:#ff3333;--cy:#00d4ff;
  /* ── Text ── */
  --tx:#e8f4ff;--mu:#6a90b8;--mu2:#4a6a8a;
  --fd:'Barlow Condensed',sans-serif;--fb:'Barlow',sans-serif;
  --r:8px;--r2:12px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body,#root{background:var(--bg);color:var(--tx);font-family:var(--fb);min-height:100vh}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--bo2);border-radius:3px}
input,select,textarea{background:var(--bg2);border:1px solid var(--bo2);color:var(--tx);font-family:var(--fb);border-radius:var(--r);padding:10px 14px;width:100%;font-size:15px;outline:none;transition:border-color .2s}
input:focus,select:focus,textarea:focus{border-color:var(--gr)}
input::placeholder{color:var(--mu)}
select option{background:var(--bg2)}
label{display:block;font-size:12px;color:var(--mu);margin-bottom:5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase}
.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:var(--r);border:none;cursor:pointer;font-family:var(--fd);font-size:16px;font-weight:700;letter-spacing:.4px;transition:transform .15s,opacity .15s,box-shadow .15s;text-decoration:none;white-space:nowrap}
.btn:hover{transform:translateY(-1px);opacity:.9;box-shadow:0 4px 16px rgba(0,0,0,.3)}
.btn:active{transform:translateY(0)}
.btn:disabled{opacity:.35;cursor:not-allowed;transform:none}
.btn-gr{background:var(--ixfo-blue);color:#fff}
.btn-go{background:var(--ixfo-orange);color:#fff}
.btn-re{background:var(--re);color:#fff}
.btn-bl{background:var(--ixfo-blue);color:#fff}
.btn-out{background:transparent;border:1.5px solid var(--bo2);color:var(--tx)}
.btn-out:hover{border-color:var(--gr);color:var(--gr)}
.btn-gh{background:var(--su);color:var(--tx)}
.btn-sm{padding:6px 14px;font-size:14px}
.btn-lg{padding:14px 30px;font-size:19px}
.btn-full{width:100%;justify-content:center}
.card{background:var(--su);border:1px solid var(--bo);border-radius:var(--r2);padding:20px}
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;font-family:var(--fd);letter-spacing:.6px;text-transform:uppercase}
.b-gr{background:rgba(0,154,222,.15);color:var(--gr);border:1px solid rgba(0,154,222,.3)}
.b-go{background:rgba(255,103,0,.12);color:var(--go);border:1px solid rgba(255,103,0,.25)}
.b-re{background:rgba(255,51,51,.12);color:var(--re);border:1px solid rgba(255,51,51,.25)}
.b-mu{background:var(--bg2);color:var(--mu);border:1px solid var(--bo)}
.b-bl{background:rgba(0,154,222,.12);color:var(--ixfo-blue);border:1px solid rgba(0,154,222,.28)}
.sec{max-width:1100px;margin:0 auto;padding:48px 20px}
.sec-sm{max-width:780px;margin:0 auto;padding:48px 20px}
.g2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:900px){.g4{grid-template-columns:repeat(2,1fr)}.g3{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.g4,.g3,.g2{grid-template-columns:1fr}}
.fx{display:flex}.fxc{display:flex;align-items:center;justify-content:center}.fxb{display:flex;align-items:center;justify-content:space-between}
.gap4{gap:4px}.gap8{gap:8px}.gap12{gap:12px}.gap16{gap:16px}.gap20{gap:20px}
.tc{text-align:center}.tl{text-align:left}
.fd{font-family:var(--fd)}
.gr{color:var(--gr)}.go{color:var(--go)}.mu{color:var(--mu)}.re{color:var(--re)}
.fw7{font-weight:700}.fw8{font-weight:800}.fw9{font-weight:900}
hr{border:none;border-top:1px solid var(--bo);margin:24px 0}

/* NAV – IXFO brand */
.nav{position:sticky;top:0;z-index:100;background:rgba(0,16,30,.97);backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,154,222,.2)}
.nav-in{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:64px;padding:0 20px}
/* IXFO Logo styled typography */
.nav-logo{font-family:var(--fd);font-size:26px;font-weight:900;color:var(--tx);text-decoration:none;letter-spacing:0;display:flex;align-items:baseline;gap:1px}
.nav-logo .ix{color:var(--tx);font-weight:400;font-style:italic}
.nav-logo .f{color:var(--tx);font-weight:900;font-size:30px}
.nav-logo .O{color:var(--ixfo-blue);font-weight:900;font-size:30px}
.nav-logo .sub{font-size:10px;color:var(--mu);font-weight:600;letter-spacing:.5px;align-self:flex-end;margin-left:8px;margin-bottom:2px;text-transform:uppercase;font-style:normal;font-family:var(--fb)}
.nav-links{display:flex;gap:3px}
.nav-btn{padding:6px 14px;border-radius:6px;border:none;background:transparent;color:var(--mu);font-family:var(--fd);font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.3px}
.nav-btn:hover,.nav-btn.on{color:var(--tx);background:var(--su)}
.nav-btn.on{color:var(--ixfo-blue)}
@media(max-width:640px){.nav-links{display:none}}
.mnav{position:fixed;bottom:0;left:0;right:0;z-index:100;background:var(--bg2);border-top:1px solid var(--bo);display:none;padding:8px 0}
.mni{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;background:none;border:none;color:var(--mu);cursor:pointer;font-size:10px;font-family:var(--fb);font-weight:600;transition:color .2s}
.mni.on{color:var(--ixfo-blue)}
.mni .ico{font-size:22px}
@media(max-width:640px){.mnav{display:flex}.sec,.sec-sm{padding-bottom:80px}}

/* HERO – fibra óptica + Mundial */
@keyframes fiberMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes orbitBall{0%,100%{transform:translateY(-50%) rotate(0deg)}50%{transform:translateY(-52%) rotate(8deg)}}
.hero{
  position:relative;overflow:hidden;min-height:calc(100vh - 64px);display:flex;align-items:center;
  background:
    radial-gradient(ellipse at 5% 80%,rgba(255,103,0,.18) 0%,transparent 45%),
    radial-gradient(ellipse at 20% 30%,rgba(0,154,222,.12) 0%,transparent 40%),
    radial-gradient(ellipse at 80% 70%,rgba(0,59,113,.4) 0%,transparent 55%),
    var(--bg);
}
/* Fiber optic wave overlay */
.hero::before{
  content:'';position:absolute;bottom:0;left:0;right:0;height:45%;
  background:linear-gradient(105deg,
    transparent 0%,#003b71 15%,#009ade 28%,#00c8ff 33%,
    #ff6700 40%,#ffa040 45%,#ffe060 48%,
    #ff6700 52%,#009ade 60%,#003b71 75%,transparent 100%);
  opacity:.12;filter:blur(6px);
  background-size:200% 100%;
  animation:fiberMove 8s ease-in-out infinite;
  pointer-events:none;
}
/* Secondary thinner fiber line */
.hero::after{
  content:'';position:absolute;bottom:20%;left:0;right:0;height:20%;
  background:linear-gradient(105deg,
    transparent 0%,#ff6700 20%,#ffd000 35%,#ff4400 45%,
    #009ade 55%,#00e5ff 65%,#003b71 80%,transparent 100%);
  opacity:.08;filter:blur(3px);
  background-size:200% 100%;
  animation:fiberMove 12s ease-in-out infinite reverse;
  pointer-events:none;
}
.hero-pat{position:absolute;inset:0;opacity:.018;background-image:repeating-linear-gradient(45deg,var(--ixfo-blue) 0,var(--ixfo-blue) 1px,transparent 0,transparent 50%);background-size:28px 28px}
.hero-c{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:60px 20px;width:100%}
.hero-ey{
  font-family:var(--fd);font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;
  color:var(--ixfo-orange);margin-bottom:14px;
  display:flex;align-items:center;gap:10px;
}
.hero-ey::before{content:'';display:inline-block;width:28px;height:2px;background:var(--ixfo-orange)}
.hero-t{font-family:var(--fd);font-size:clamp(54px,8.5vw,112px);font-weight:900;line-height:.88;color:var(--tx);text-transform:uppercase;letter-spacing:-1px}
.hero-t .hl{color:var(--ixfo-blue);display:block}
.hero-t .yr{color:var(--ixfo-orange)}
.hero-s{font-size:17px;color:var(--mu);max-width:480px;margin:20px 0 36px;line-height:1.6}
.hero-ctas{display:flex;gap:12px;flex-wrap:wrap}
/* Orbiting World Cup badge */
.hero-ball{
  position:absolute;right:7%;top:50%;transform:translateY(-50%);
  width:220px;height:220px;border-radius:50%;
  background:radial-gradient(circle at 40% 40%,rgba(0,154,222,.18),rgba(0,59,113,.3) 60%,transparent 100%);
  border:1px solid rgba(0,154,222,.3);
  box-shadow:0 0 40px rgba(0,154,222,.15),0 0 80px rgba(255,103,0,.08);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:var(--fd);text-align:center;
  animation:orbitBall 6s ease-in-out infinite;
}
/* Orange arc accent on hero ball */
.hero-ball::before{
  content:'';position:absolute;inset:-8px;border-radius:50%;
  border:2px solid transparent;
  border-top-color:var(--ixfo-orange);border-right-color:var(--ixfo-orange);
  transform:rotate(-30deg);opacity:.5;
}
.hero-ball-ico{font-size:64px;filter:drop-shadow(0 2px 12px rgba(255,103,0,.4))}
.hero-ball-txt{font-size:12px;font-weight:700;color:var(--ixfo-blue);letter-spacing:1.5px;text-transform:uppercase;margin-top:10px;line-height:1.4}
.hero-ball-date{font-size:13px;font-weight:800;color:var(--ixfo-orange);margin-top:4px}
@media(max-width:768px){.hero-ball{display:none}.hero{min-height:auto;padding:20px 0}}

/* STATS */
.stat-n{font-family:var(--fd);font-size:54px;font-weight:900;line-height:1}
.stat-l{font-size:12px;color:var(--mu);text-transform:uppercase;letter-spacing:1px;margin-top:4px}

/* PRIZE */
.pz{background:var(--su);border:1px solid var(--bo);border-radius:var(--r2);padding:24px;text-align:center;transition:border-color .2s,transform .2s,box-shadow .2s}
.pz:hover{border-color:var(--ixfo-orange);transform:translateY(-3px);box-shadow:0 8px 24px rgba(255,103,0,.15)}
.pz-ico{font-size:48px;margin-bottom:12px}
.pz-t{font-family:var(--fd);font-size:17px;font-weight:800;text-transform:uppercase;margin-bottom:6px}
.pz-s{font-size:13px;color:var(--mu);line-height:1.5}

/* CALENDAR */
.cal-r{display:grid;grid-template-columns:44px 1fr 130px 100px;gap:12px;align-items:center;padding:13px 16px;border-radius:var(--r);transition:background .15s;border-bottom:1px solid var(--bo)}
.cal-r:last-child{border-bottom:none}
.cal-r:hover{background:var(--su2)}
.cal-n{font-family:var(--fd);font-size:22px;font-weight:900;color:var(--mu2)}
.cal-ev{font-family:var(--fd);font-size:15px;font-weight:700;text-transform:uppercase}
.cal-d{font-size:13px;color:var(--mu)}
@media(max-width:640px){.cal-r{grid-template-columns:36px 1fr}.cal-r .cal-date,.cal-r .cal-loc{display:none}}

/* FORM */
.fg{margin-bottom:16px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.ferr{font-size:12px;color:var(--re);margin-top:4px}
@media(max-width:560px){.fr{grid-template-columns:1fr}}

/* PCARD */
.pc{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:var(--r);background:var(--bg2);border:1px solid var(--bo);transition:border-color .2s}
.pc:hover{border-color:var(--bo2)}
.pc-n{font-family:var(--fd);font-size:18px;font-weight:800;color:var(--mu2);width:26px;flex-shrink:0}
.pc-name{font-weight:600;font-size:15px;flex:1}
.pc-d{font-size:13px;color:var(--mu)}

/* SORTEO ANIMATION */
@keyframes flipIn{0%{transform:rotateY(90deg) scale(.8);opacity:0}60%{transform:rotateY(-8deg) scale(1.04)}100%{transform:rotateY(0) scale(1);opacity:1}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,154,222,.4)}50%{box-shadow:0 0 20px 4px rgba(0,154,222,.2)}}
.sc{padding:14px 10px;border-radius:var(--r2);text-align:center;background:var(--su);border:1px solid var(--bo);animation:flipIn .4s ease}
.sc.tit{border-color:var(--ixfo-blue)}
.sc.sup{border-color:var(--mu2)}
.sc.glow{animation:glowPulse 1.2s infinite}
.sc-lbl{font-family:var(--fd);font-size:10px;font-weight:700;color:var(--mu);letter-spacing:1px;margin-bottom:4px;text-transform:uppercase}
.sc-name{font-family:var(--fd);font-size:15px;font-weight:800;text-transform:uppercase;margin-bottom:8px;line-height:1.1}
.sc-flag{font-size:24px}
.sc-team{font-size:11px;color:var(--mu);margin-top:3px}

/* BRACKET */
.bwrap{overflow-x:auto;padding-bottom:12px}
.bracket{display:flex;min-width:max-content}
.brnd{display:flex;flex-direction:column}
.brnd-t{font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--mu);text-align:center;padding:8px 12px;background:var(--su);border-bottom:1px solid var(--bo);position:sticky;top:0;white-space:nowrap}
.bmatches{display:flex;flex-direction:column;padding:10px 6px;gap:6px;flex:1;justify-content:space-around;min-width:170px}
.bmatch{background:var(--bg2);border:1px solid var(--bo);border-radius:var(--r);overflow:hidden}
.bp{padding:7px 10px;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:6px;cursor:pointer;transition:background .15s;min-height:34px}
.bp:hover{background:var(--su2)}
.bp.win{background:rgba(0,154,222,.12);color:var(--ixfo-blue)}
.bp.los{opacity:.35}
.bp+.bp{border-top:1px solid var(--bo)}
.bp .bt{font-size:11px;color:var(--mu);flex-shrink:0}
.bp .check{color:var(--ixfo-blue);font-size:14px}
.bconn{display:flex;flex-direction:column;justify-content:space-around;align-items:center;width:20px;padding:10px 0;gap:6px}
.bconn-ln{width:12px;height:2px;background:var(--bo2)}

/* ADMIN */
.atabs{display:flex;gap:2px;padding:14px 20px 0;border-bottom:1px solid var(--bo);overflow-x:auto}
.atab{padding:9px 18px;border-radius:var(--r) var(--r) 0 0;border:none;background:transparent;color:var(--mu);font-family:var(--fd);font-size:15px;font-weight:700;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s}
.atab:hover{color:var(--tx)}
.atab.on{color:var(--ixfo-blue);border-bottom-color:var(--ixfo-blue);background:var(--su)}
.tw{overflow-x:auto;border-radius:var(--r2);border:1px solid var(--bo)}
table{width:100%;border-collapse:collapse;font-size:14px}
th{background:var(--su);padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--mu);letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid var(--bo);white-space:nowrap}
td{padding:9px 14px;border-bottom:1px solid var(--bo);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.015)}

/* MESSAGES */
.msg{padding:12px 16px;border-radius:var(--r);font-size:14px;margin-bottom:16px}
.ms{background:rgba(0,154,222,.1);border:1px solid rgba(0,154,222,.28);color:var(--ixfo-blue)}
.me{background:rgba(255,51,51,.08);border:1px solid rgba(255,51,51,.22);color:var(--re)}
.mi{background:rgba(255,103,0,.08);border:1px solid rgba(255,103,0,.22);color:var(--ixfo-orange)}

/* MODAL */
.mo{position:fixed;inset:0;background:rgba(0,10,20,.92);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
.mo-b{background:var(--su);border:1px solid rgba(0,154,222,.3);border-radius:var(--r2);max-width:440px;width:100%;padding:32px}
.mo-t{font-family:var(--fd);font-size:26px;font-weight:900;margin-bottom:8px}
.mo-s{color:var(--mu);font-size:14px;margin-bottom:24px}

/* EMPTY */
.empty{text-align:center;padding:60px 20px}
.empty-ico{font-size:54px;margin-bottom:16px;opacity:.35}
.empty-t{font-family:var(--fd);font-size:22px;font-weight:800;color:var(--mu)}
.empty-s{font-size:14px;color:var(--mu2);margin-top:8px}

/* CHAMPION – IXFO orange/blue themed */
.champ{
  background:linear-gradient(135deg,rgba(255,103,0,.12),rgba(0,59,113,.2));
  border:2px solid var(--ixfo-orange);border-radius:var(--r2);padding:28px;text-align:center;
  position:relative;overflow:hidden;
}
.champ::before{
  content:'🏆';position:absolute;right:-10px;top:-10px;font-size:80px;opacity:.07;
}
.champ-lbl{font-family:var(--fd);font-size:12px;font-weight:700;letter-spacing:2px;color:var(--ixfo-orange);text-transform:uppercase;margin-bottom:8px}
.champ-name{font-family:var(--fd);font-size:36px;font-weight:900;text-transform:uppercase;color:var(--tx)}
.champ-team{font-size:32px;margin-top:8px}

/* SEC TITLE */
.st{font-family:var(--fd);font-size:clamp(28px,5vw,46px);font-weight:900;text-transform:uppercase;line-height:1}
.ss{color:var(--mu);font-size:15px;margin-top:8px}
.sh{margin-bottom:32px}

/* STEP – numbered with IXFO blue */
.step{display:flex;gap:16px;align-items:flex-start}
.step-n{font-family:var(--fd);font-size:32px;font-weight:900;color:var(--ixfo-blue);line-height:1;flex-shrink:0;width:32px}
.step-t{font-family:var(--fd);font-size:16px;font-weight:700;text-transform:uppercase;margin-bottom:4px}
.step-d{font-size:14px;color:var(--mu);line-height:1.6}

/* COUNTDOWN – IXFO orange numbers */
.countdown{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:24px 0}
.cd-box{background:var(--su);border:1px solid rgba(0,154,222,.25);border-radius:var(--r);padding:14px 18px;text-align:center;min-width:80px}
.cd-n{font-family:var(--fd);font-size:42px;font-weight:900;line-height:1;color:var(--ixfo-orange)}
.cd-l{font-size:10px;color:var(--mu);letter-spacing:1px;text-transform:uppercase;margin-top:4px}

/* TORNEO SELECT */
.tos{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.to-btn{padding:8px 16px;border-radius:var(--r);border:1px solid var(--bo);background:var(--bg2);color:var(--mu);font-family:var(--fd);font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
.to-btn:hover{border-color:var(--ixfo-blue);color:var(--tx)}
.to-btn.on{border-color:var(--ixfo-blue);color:var(--ixfo-blue);background:rgba(0,154,222,.1)}
.to-btn.gf{border-color:rgba(255,103,0,.4);color:var(--ixfo-orange)}
.to-btn.gf.on{background:rgba(255,103,0,.1);border-color:var(--ixfo-orange)}

/* ESTADO BADGES */
.estado-pend{}.estado-sort{color:var(--ixfo-blue)}.estado-fin{color:var(--ixfo-blue)}

/* LIVE PULSE */
@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}
/* PROGRESS BAR — redirect post-inscripción */
@keyframes progressBar{0%{width:0%}100%{width:100%}}
/* TOAST — notificación admin */
@keyframes toastIn{0%{opacity:0;transform:translateX(-50%) translateY(-12px)}100%{opacity:1;transform:translateX(-50%) translateY(0)}}
`;

/* ══════════════════════════════════════════════════════════════
   COMPONENTS
══════════════════════════════════════════════════════════════ */

function NavBar({ view, setView, cfg }) {
  const items = [
    { id: "inicio", label: "Inicio", ico: "🏠" },
    { id: "inscripcion", label: "Inscripción", ico: "✍️" },
    { id: "sorteos", label: "Sorteos", ico: "🎲" },
    { id: "resultados", label: "Resultados", ico: "🏆" },
    { id: "admin", label: "Admin", ico: "⚙️" },
  ];
  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          {/* IXFO logo real */}
          <span style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }} onClick={() => setView("inicio")}>
            <img src={IXFO_LOGO_B64} alt="IXFO" style={{ height: 38, width: "auto", display: "block" }} />
            <span style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--mu)", fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", lineHeight: 1.3, borderLeft: "1px solid var(--bo)", paddingLeft: 10 }}>
              Internet<br />por Fibra Óptica
            </span>
          </span>
          <div className="nav-links">
            {items.map(i => (
              <button key={i.id} className={`nav-btn${view === i.id ? " on" : ""}`} onClick={() => setView(i.id)}>{i.label}</button>
            ))}
          </div>
        </div>
      </nav>
      <div className="mnav">
        {items.map(i => (
          <button key={i.id} className={`mni${view === i.id ? " on" : ""}`} onClick={() => setView(i.id)}>
            <span className="ico">{i.ico}</span>{i.label}
          </button>
        ))}
      </div>
    </>
  );
}

/* ────────── INICIO ────────── */
function InicioView({ cfg, torneos, participants, setView }) {
  const [countdown, setCountdown] = useState({});
  useEffect(() => {
    const tick = () => {
      // Countdown al próximo torneo no finalizado (fechas editables desde Config)
      const ahora = new Date();
      // Intentar parsear fecha del torneo (formato libre, ej: "Lunes 4 de Mayo")
      const MESES = {enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,
        julio:6,agosto:7,septiembre:8,octubre:9,noviembre:10,diciembre:11};
      const parseDate = (fechaStr) => {
        if (!fechaStr) return null;
        const m = fechaStr.toLowerCase().match(/(\d+)\s+de\s+(\w+)/);
        if (!m) return null;
        const d = parseInt(m[1]), mes = MESES[m[2]];
        if (isNaN(d) || mes === undefined) return null;
        const año = ahora.getFullYear() + (mes < ahora.getMonth() ? 1 : 0);
        return new Date(año, mes, d, 15, 0, 0); // 15hs por defecto
      };
      const proximo = torneos
        .filter(t => t.estado !== "finalizado")
        .map(t => ({ t, d: parseDate(t.fecha) }))
        .filter(x => x.d && x.d > ahora)
        .sort((a, b) => a.d - b.d)[0];
      const target = proximo?.d || new Date("2026-05-04T15:00:00-03:00");
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) return setCountdown({ d: 0, h: 0, m: 0, s: 0 });
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ d, h, m, s });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [torneos]);

  const campeones = torneos.filter(t => !t.isGranFinal && t.campeon);
  const statusBadge = (t) => {
    if (t.estado === "finalizado") return <span className="badge b-gr">Finalizado</span>;
    if (t.estado === "sorteado" || t.titulares.length > 0) return <span className="badge b-bl">Sorteado</span>;
    return <span className="badge b-mu">Pendiente</span>;
  };

  return (
    <div>
      {/* HERO */}
      <div className="hero">
        <div className="hero-pat" />
        <div className="hero-c">
        <div className="hero-ey">
          <img src={IXFO_LOGO_B64} alt="IXFO" style={{ height: 32, width: "auto", verticalAlign: "middle", marginRight: 4 }} />
          presenta
        </div>
          <div className="hero-t">
            <span>Mundialito</span>
            <span className="hl">ixfO</span>
            <span className="yr">2026</span>
          </div>
          <div className="hero-s">{cfg.tagline}</div>
          <div className="hero-ctas">
            <button className="btn btn-go btn-lg" onClick={() => setView("inscripcion")}>✍️ Inscribirme Gratis</button>
            <button className="btn btn-out btn-lg" onClick={() => setView("sorteos")}>🎲 Ver Sorteos</button>
          </div>
          {/* IXFO brand strip */}
          <div style={{ marginTop: 40, display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["⚡", "Fibra Óptica", "La red más rápida"], ["🎮", "FC 26", "Next Gen · Eliminación Directa"], ["🏆", "Gran Final", "6 de Junio · Posadas"]].map(([ico, t, d]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 22 }}>{ico}</div>
                <div>
                  <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 800, color: "var(--ixfo-blue)", textTransform: "uppercase", letterSpacing: .5 }}>{t}</div>
                  <div style={{ fontSize: 12, color: "var(--mu)" }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* World Cup ball orbit */}
        <div className="hero-ball">
          <div className="hero-ball-ico">⚽</div>
          <div className="hero-ball-txt">Copa Mundial<br />FIFA 2026</div>
          <div className="hero-ball-date">Jun – Jul 2026</div>
        </div>
      </div>

      {/* COUNTDOWN */}
      <div style={{ background: "var(--ixfo-navy)", borderBottom: "3px solid var(--ixfo-orange)", padding: "24px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>⏱ Primer Clasificatorio en</div>
          <div className="countdown">
            {[["d", "Días"], ["h", "Horas"], ["m", "Min"], ["s", "Seg"]].map(([k, l]) => (
              <div key={k} className="cd-box"><div className="cd-n">{String(countdown[k] ?? "—").padStart(2, "0")}</div><div className="cd-l">{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="sec">
        {/* STATS */}
        <div className="g4 tc" style={{ marginBottom: 60 }}>
          {[["8", "Torneos Clasificatorios", "var(--ixfo-blue)"], ["128", "Participantes", "var(--ixfo-orange)"], ["48", "Selecciones FIFA 2026", "var(--ixfo-blue)"], ["1", "Gran Final", "var(--ixfo-orange)"]].map(([n, l, c]) => (
            <div key={l} className="card" style={{ borderColor: "var(--bo2)" }}>
              <div className="stat-n" style={{ color: c }}>{n}</div>
              <div className="stat-l">{l}</div>
            </div>
          ))}
        </div>

        {/* PREMIOS */}
        <div className="sh">
          <div className="st">🏆 Premios</div>
          <div className="ss">Competí y ganate algo increíble</div>
        </div>
        <div className="g4" style={{ marginBottom: 60 }}>
          {[
            { ico: "🎮", t: "1er Puesto Gran Final", d: "Consola PlayStation 5 + Trofeo de Campeón", border: "var(--ixfo-orange)" },
            { ico: "👕", t: "2do Puesto Gran Final", d: "Camiseta Oficial Adidas Argentina 2026 + Medalla", border: "var(--ixfo-blue)" },
            { ico: "🏆", t: "Ganador Clasificatorio", d: "Trofeo + Pase directo a la Gran Final", border: "var(--ixfo-blue)" },
            { ico: "⚽", t: "Participante Clasificatorio", d: "Camiseta Argentina Edición IXFO", border: "var(--bo2)" },
          ].map(p => (
            <div key={p.t} className="pz" style={{ borderColor: p.border }}>
              <div className="pz-ico">{p.ico}</div>
              <div className="pz-t">{p.t}</div>
              <div className="pz-s">{p.d}</div>
            </div>
          ))}
        </div>

        {/* CALENDARIO */}
        <div className="sh">
          <div className="st">📅 Calendario</div>
          <div className="ss">Todos los eventos de 15:00 a 19:00 hs</div>
        </div>
        <div className="card" style={{ padding: 0, marginBottom: 60 }}>
          {torneos.map(t => (
            <div key={t.id} className="cal-r">
              <div className="cal-n" style={{ color: t.isGranFinal ? "var(--go)" : "var(--mu2)" }}>{t.id}</div>
              <div>
                <div className="cal-ev" style={{ color: t.isGranFinal ? "var(--go)" : "var(--tx)" }}>{t.nombre}</div>
                <div className="cal-d">{t.fecha}</div>
              </div>
              <div className="cal-d cal-date">📍 {t.sede}{t.direccionSede ? ` — ${t.direccionSede}` : ""}</div>
              <div style={{ textAlign: "right" }} className="cal-loc">{statusBadge(t)}</div>
            </div>
          ))}
        </div>

        {/* CÓMO FUNCIONA */}
        <div className="sh">
          <div className="st">❓ ¿Cómo funciona?</div>
          <div className="ss">6 pasos para ser el Campeón del Mundialito IXFO</div>
        </div>
        <div className="g2 gap20" style={{ marginBottom: 60 }}>
          {[
            ["1", "Inscribite", "Completá el formulario online con tus datos. Inscripción gratuita y abierta a mayores de 12 años."],
            ["2", "Esperá el Sorteo", "48 hs antes de cada torneo se sortean 16 titulares + 5 suplentes en vivo por redes sociales."],
            ["3", "Confirmá asistencia", "Tenés 24 hs para confirmar tu lugar. Si no respondés, pasa al primer suplente."],
            ["4", "Sorteo de Equipos", "En el evento, cada participante sortea una selección de las 48 clasificadas al Mundial FIFA 2026."],
            ["5", "Competí", "Eliminación directa. 16 participantes, 15 partidos, un solo campeón en 4 horas de gaming."],
            ["6", "Clasificá a la Gran Final", "El ganador de cada torneo obtiene su pase a la Gran Final del Sábado 6 de Junio. 🏆"],
          ].map(([n, t, d]) => (
            <div key={n} className="step">
              <div className="step-n">{n}</div>
              <div><div className="step-t">{t}</div><div className="step-d">{d}</div></div>
            </div>
          ))}
        </div>

        {/* CAMPEONES */}
        {campeones.length > 0 && (
          <>
            <div className="sh">
              <div className="st">🏅 Clasificados a la Gran Final</div>
            </div>
            <div className="g4" style={{ marginBottom: 40 }}>
              {campeones.map(t => {
                const c = participants.find(p => p.id === t.campeon);
                const eq = t.equipos[t.campeon];
                const equipo = EQUIPOS_FIFA_2026.find(e => e.nombre === eq);
                return (
                  <div key={t.id} className="card card-gold" style={{ textAlign: "center", borderColor: "var(--go2)" }}>
                    <div style={{ marginBottom: 6 }}><FlagImg iso={equipo?.iso} size={28} /></div>
                    <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 15, textTransform: "uppercase" }}>{c ? pName(c) : "?"}</div>
                    <div style={{ fontSize: 12, color: "var(--mu)", marginTop: 4 }}>{t.nombre}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="card tc" style={{ borderColor: "var(--ixfo-blue)", background: "linear-gradient(135deg, rgba(0,59,113,.4), rgba(0,154,222,.06))", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚽</div>
          <div className="st" style={{ marginBottom: 12 }}>¡Inscribite ahora!</div>
          <div className="ss" style={{ marginBottom: 24 }}>La participación es totalmente gratuita. Plazas limitadas.</div>
          <div className="fxc gap12" style={{ flexWrap: "wrap" }}>
            <button className="btn btn-go btn-lg" onClick={() => setView("inscripcion")}>✍️ Quiero participar</button>
            {cfg.whatsapp && <a href={`https://wa.me/${cfg.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="btn btn-gh btn-lg">💬 WhatsApp</a>}
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: "var(--mu)" }}>
            🌐 ixfo.com.ar &nbsp;·&nbsp; 📞 0800 3452535 &nbsp;·&nbsp; {cfg.instagram}
          </div>
        </div>

        {/* Disclaimer legal */}
        <div style={{ marginTop: 24, padding: "12px 16px", borderRadius: "var(--r)",
          background: "var(--bg2)", border: "1px solid var(--bo)",
          fontSize: 11, color: "var(--mu)", fontStyle: "italic",
          lineHeight: 1.6, textAlign: "center" }}>
          ⚠️ {DISCLAIMER_TEXT}
        </div>
      </div>
    </div>
  );
}

/* ────────── FORM FIELD (fuera del componente para evitar re-mount) ────────── */
function FormField({ label, name, type = "text", placeholder = "", value, onChange, error }) {
  return (
    <div className="fg">
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        autoComplete="off"
      />
      {error && <div className="ferr">⚠ {error}</div>}
    </div>
  );
}

/* ────────── REGLAMENTO MODAL ────────── */
const REGLAMENTO_TEXTO = [
  { t: "1. Objetivo", b: "El Mundialito IXFO 2026 es un torneo de FC 26 (versión Next Gen) organizado por IXFO Internet por Fibra Óptica como campaña de fidelización y captación en Posadas y Garupá, Misiones. Este torneo no está afiliado ni patrocinado por Electronic Arts Inc. o sus licenciantes." },
  { t: "2. Participantes y Elegibilidad", b: "10.1.1 Edad mínima: Podrán inscribirse y participar personas desde 12 años cumplidos al momento de la inscripción. 10.1.5 Residencia: Torneo dirigido a residentes de la República Argentina." },
  { t: "2.1 Menores de Edad – Acompañamiento Obligatorio", b: "Los menores de 18 años deberán asistir acompañados por su padre, madre o tutor legal, quien deberá permanecer en el recinto durante todo el evento. La ausencia del adulto responsable implicará la descalificación automática del menor." },
  { t: "2.2 Documentación para Menores", b: "El adulto responsable deberá presentar y firmar el Anexo I – Autorización para Menores de Edad y el Anexo II – Uso de Imagen y Voz." },
  { t: "2.3 Personas No Elegibles", b: "Para garantizar la total transparencia e imparcialidad del torneo, no podrán inscribirse ni participar: (a) Empleados directos de IXFO Internet por Fibra Óptica con contrato laboral vigente, sea permanente o temporal. (b) Familiares directos de empleados de IXFO: cónyuge, conviviente, padres, hijos y hermanos. (c) Personal de empresas contratistas vinculadas a la organización, logística o producción técnica del torneo. (d) Personal de agencias de publicidad o marketing que presten servicios de comunicación, diseño o manejo de redes para esta campaña. (e) Empleados y propietarios de los locales patrocinadores sede de las fechas. (f) Familiares directos (cónyuge, conviviente, padres, hijos y hermanos) de cualquier persona de los incisos anteriores. La organización se reserva el derecho de verificar y descalificar a cualquier participante comprendido en estas restricciones, aun cuando se descubra durante o después del torneo, con la consecuente pérdida de premios." },
  { t: "3. Configuración oficial del juego", b: "Plataforma: Next Gen (PC / PS5 / Xbox Series X|S). Nivel de media: 95 para todos. Dificultad: Legendaria (solo para arqueros e IA). Velocidad: Competitiva. Cámara: Transmisión TV. Duración Clasificatorios — Octavos y Cuartos: 3 min/tiempo; Semifinal y Final: 6 min/tiempo. Duración Gran Final — Cuartos y Semis: 4 min/tiempo; Final: 5 min/tiempo. Desempate: Prórroga Gol de Oro + Penales." },
  { t: "4. Ajustes permitidos", b: "Se usa la Configuración Competitiva por defecto. Se permiten solo: elección de Defensa (Táctica o Avanzada), Tiro (Precisión o Asistido) y Player Lock (activar/desactivar). Está prohibido modificar cualquier otra asistencia, y el uso de trampas, bugs o manipulación de hardware/software." },
  { t: "5. Gestión del tiempo", b: "Pre-partido: se puede configurar mando y formación, pero NO táctica personalizada. Entretiempo: 1 minuto para cambios. Durante el juego: no se permiten pausas salvo fuerza mayor validada por el organizador." },
  { t: "6. Puntualidad y W.O.", b: "Check-in: 14:45–15:00 hs. Inicio de partidos: 15:15 hs. El jugador que no esté presente al ser llamado pierde por W.O. (3-0). Si un titular no se presenta, se llama al primer suplente presente." },
  { t: "7. Sorteo de equipos", b: "Solo selecciones nacionales. Se sortean las 48 clasificadas al Mundial FIFA 2026. Cada jugador extrae al azar su selección antes del primer partido y debe usarla durante toda la jornada. En la Gran Final se repite el sorteo para los 8 campeones." },
  { t: "8. Fair play", b: "Cualquier conducta antideportiva, falta de respeto o daño al equipamiento implica descalificación inmediata. La organización se reserva el derecho de admisión y permanencia." },
  { t: "9. Inscripción y sorteo de participantes", b: "Inscripción gratuita. Para cada torneo se sortean 16 titulares + 5 suplentes en vivo 48 hs antes del evento. Los seleccionados tienen 24 hs para confirmar. En caso de no confirmar, se convoca al primer suplente." },
  { t: "10. Premios", b: "Participante Clasificatorio: Camiseta Argentina Edición IXFO. Ganador Clasificatorio: Trofeo + Pase a la Gran Final. Gran Final 1er Puesto: Consola PlayStation 5 + Trofeo. Gran Final 2do Puesto: Camiseta Adidas Argentina Oficial + Medalla. Gran Final Participación: Medalla de Finalista. Los premios son presenciales e intransferibles." },
  { t: "11. Uso de imagen", b: "Al inscribirse el participante autoriza a IXFO a captar y difundir su imagen, voz y nombre con fines promocionales del evento, sin compensación económica, por el plazo de 2 años. Para menores, esta autorización debe firmarla el adulto responsable." },
  { t: "12. Disposiciones finales", b: "IXFO puede modificar el reglamento por fuerza mayor comunicándolo por canales oficiales. Las decisiones del Equipo de Coordinación son definitivas e inapelables. Jurisdicción: Tribunales Ordinarios de Posadas, Misiones." },
];

const FECHAS_DISP = [
  { id: "f1", label: "Lun 4/5 – Posadas" }, { id: "f2", label: "Mar 5/5 – Garupá" },
  { id: "f3", label: "Mié 6/5 – Posadas" }, { id: "f4", label: "Jue 7/5 – Garupá" },
  { id: "f5", label: "Lun 11/5 – Posadas" }, { id: "f6", label: "Mar 12/5 – Garupá" },
  { id: "f7", label: "Mié 13/5 – Posadas" }, { id: "f8", label: "Jue 14/5 – Garupá" },
];

function ReglamentoModal({ onClose }) {
  return (
    <div className="mo" onClick={onClose}>
      <div className="mo-b" style={{ maxWidth: 680, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div className="fxb" style={{ marginBottom: 12, flexShrink: 0 }}>
          <div className="mo-t" style={{ fontSize: 20 }}>📋 Reglamento Mundialito IXFO 2026</div>
          <button className="btn btn-out btn-sm" onClick={onClose}>✕ Cerrar</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, paddingRight: 8 }}>
          {REGLAMENTO_TEXTO.map((sec, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 800, color: "var(--ixfo-blue)", textTransform: "uppercase", marginBottom: 4 }}>{sec.t}</div>
              <div style={{ fontSize: 13, color: "var(--tx)", lineHeight: 1.65 }}>{sec.b}</div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "12px 14px", background: "rgba(255,103,0,.08)", border: "1px solid rgba(255,103,0,.25)", borderRadius: "var(--r)", fontSize: 12, color: "var(--ixfo-orange)" }}>
            Versión completa: Mundialito IXFO 2026 – Versión Final – Abril 2026
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── INSCRIPCIÓN ────────── */
function InscripcionView({ participants, setParticipants, setView }) {
  const FORM_INIT = {
    nombre: "", apellido: "", dni: "", fechaNac: "",
    email: "", whatsapp: "", ciudad: "",
    clienteIxfo: "", novedades: false,
  };
  const [form, setForm]             = useState(FORM_INIT);
  const [errors, setErrors]         = useState({});
  const [checks, setChecks]         = useState({ bases: false, imagen: false });
  const [checkErr, setCheckErr]     = useState(false);
  const [showReglamento, setShowReglamento] = useState(false);
  const [inscripto, setInscripto]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (name, value) => setForm(p => ({ ...p, [name]: value }));

  // Calcula edad exacta desde fecha de nacimiento
  const calcEdad = (fechaNac) => {
    if (!fechaNac) return null;
    const hoy = new Date();
    const nac = new Date(fechaNac + "T12:00:00");
    if (isNaN(nac.getTime())) return null;
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const edad = calcEdad(form.fechaNac);
  const esMenor = edad !== null && edad >= 12 && edad < 18;

  const validate = () => {
    const e = {};

    if (!form.nombre.trim()) e.nombre = "Requerido";
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']+$/.test(form.nombre))
      e.nombre = "Solo letras y espacios";

    if (!form.apellido.trim()) e.apellido = "Requerido";
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']+$/.test(form.apellido))
      e.apellido = "Solo letras y espacios";

    if (!form.dni.trim()) e.dni = "Requerido";
    else if (!/^\d+$/.test(form.dni)) e.dni = "Solo números";
    else if (form.dni.length < 7 || form.dni.length > 8) e.dni = "DNI: 7 u 8 dígitos";
    else if (participants.some(p => p.dni === form.dni)) e.dni = "Este DNI ya está inscripto";

    if (!form.fechaNac) e.fechaNac = "Requerido";
    else {
      const ed = calcEdad(form.fechaNac);
      if (ed === null) e.fechaNac = "Fecha inválida";
      else if (ed < 12) e.fechaNac = `Edad mínima 12 años (tenés ${ed})`;
      else if (ed > 80) e.fechaNac = "Fecha de nacimiento inválida";
    }

    if (!form.email.trim()) e.email = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";

    if (!form.whatsapp.trim()) e.whatsapp = "Requerido";
    else if (!/^[0-9+\s\-()\.]+$/.test(form.whatsapp)) e.whatsapp = "Solo números, +, espacios y guiones";
    else if (form.whatsapp.replace(/\D/g, "").length < 7) e.whatsapp = "Número muy corto";

    if (!form.ciudad) e.ciudad = "Seleccioná una ciudad";
    if (!form.clienteIxfo) e.clienteIxfo = "Requerido";

    setErrors(e);
    if (!checks.bases || !checks.imagen) { setCheckErr(true); return false; }
    setCheckErr(false);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const nuevo = {
      ...form,
      edad: edad !== null ? String(edad) : "",
      id: uid(),
      fechaInscripcion: new Date().toISOString(),
    };
    try {
      const result = await apiPost("/participants", nuevo);
      if (!result) throw new Error("Sin respuesta del servidor");
      setInscripto(nuevo);
      setForm(FORM_INIT);
      setChecks({ bases: false, imagen: false });
      setErrors({});
    } catch(err) {
      const msg = (err.message || "").toLowerCase().includes("dni")
        ? "Este DNI ya está inscripto."
        : "Error al guardar. Verificá que el servidor esté corriendo e intentá de nuevo.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const totalInscriptos = participants.length;

  // ── Redirect automático al inicio tras inscripción exitosa ──
  // useEffect SIEMPRE fuera de cualquier if (regla de hooks de React)
  useEffect(() => {
    if (!inscripto) return;
    const t = setTimeout(() => setView("inicio"), 4000);
    return () => clearTimeout(t);
  }, [inscripto]);

  // ── Post submit: pantalla de confirmación ──
  if (inscripto) {
    const esM = parseInt(inscripto.edad) < 18;

    return (
      <div className="sec-sm">
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 38, fontWeight: 900,
            color: "var(--ixfo-blue)", textTransform: "uppercase", marginBottom: 10 }}>
            ¡Inscripción Exitosa!
          </div>
          <div style={{ fontSize: 16, color: "var(--tx)", marginBottom: 6 }}>
            Hola <strong>{inscripto.nombre} {inscripto.apellido}</strong>, tu inscripción fue registrada.
          </div>
          <div style={{ fontSize: 14, color: "var(--mu)", marginBottom: 32, lineHeight: 1.6 }}>
            Te avisaremos por WhatsApp/Email si resultás sorteado,<br />
            48 hs antes del evento. ¡Buena suerte!
          </div>

          {/* Documentos si aplica */}
          {esM && (
            <div className="card" style={{ textAlign: "left", marginBottom: 24,
              borderColor: "var(--ixfo-orange)", background: "rgba(255,103,0,.05)" }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 800,
                textTransform: "uppercase", color: "var(--ixfo-orange)", marginBottom: 10 }}>
                ⚠️ Menor de edad — documentación requerida
              </div>
              <div style={{ fontSize: 13, color: "var(--mu)", marginBottom: 12, lineHeight: 1.5 }}>
                Descargá e imprimí el Anexo I antes del evento. Si no podés, tendremos copias en el check-in.
              </div>
              <a href={ANEXO1_PDF_B64} download="Anexo_I_Autorizacion_Menores_MundialitoIXFO.pdf"
                className="btn btn-go btn-full" style={{ justifyContent: "center" }}>
                📄 Descargar Anexo I – Autorización para Menores
              </a>
            </div>
          )}

          <a href={ANEXO2_PDF_B64} download="Anexo_II_Uso_de_Imagen_MundialitoIXFO.pdf"
            className="btn btn-out btn-sm" style={{ marginBottom: 28 }}>
            📄 Descargar Anexo II – Uso de imagen y voz
          </a>

          {/* Countdown visual hacia el redirect */}
          <div style={{ marginTop: 8, fontSize: 13, color: "var(--mu)" }}>
            Volviendo al inicio en unos segundos...
          </div>
          <div style={{ marginTop: 12, height: 4, borderRadius: 2,
            background: "var(--bo)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: "var(--ixfo-blue)",
              animation: "progressBar 4s linear forwards",
            }} />
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-out btn-sm" onClick={() => setView("inicio")}>
              🏠 Ir al inicio ahora
            </button>
            <button className="btn btn-out btn-sm" onClick={() => setInscripto(null)}>
              ✍️ Inscribir otra persona
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario principal ──
  return (
    <div className="sec-sm">
      {showReglamento && <ReglamentoModal onClose={() => setShowReglamento(false)} />}

      <div className="sh">
        <div className="st">✍️ Inscripción</div>
        <div className="ss">Participación gratuita · Desde 12 años · Residentes en Argentina · Cupos limitados</div>
      </div>

      {/* Contador público — solo total */}
      <div style={{ marginBottom: 24 }}>
        <div className="card" style={{ display: "inline-block", minWidth: 160, textAlign: "center", borderColor: "rgba(0,154,222,.3)" }}>
          <div className="stat-n" style={{ fontSize: 42, color: "var(--ixfo-blue)" }}>{totalInscriptos}</div>
          <div className="stat-l">Inscriptos</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800, marginBottom: 16, textTransform: "uppercase" }}>
          Formulario de Inscripción
        </div>

        {/* Datos personales */}
        <div style={{ fontFamily: "var(--fd)", fontSize: 11, fontWeight: 700, color: "var(--mu)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
          Datos Personales
        </div>
        <div className="fr">
          <FormField name="nombre" label="Nombre" placeholder="Juan"
            value={form.nombre} onChange={handleChange} error={errors.nombre} />
          <FormField name="apellido" label="Apellido" placeholder="Pérez"
            value={form.apellido} onChange={handleChange} error={errors.apellido} />
        </div>

        <div className="fr">
          {/* DNI — solo números */}
          <div className="fg">
            <label>DNI (solo números)</label>
            <input
              type="text" inputMode="numeric" placeholder="28123456"
              value={form.dni}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                handleChange("dni", v);
              }}
            />
            {errors.dni && <div className="ferr">⚠ {errors.dni}</div>}
          </div>

          {/* Fecha de nacimiento — calcula edad automáticamente */}
          <div className="fg">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              value={form.fechaNac}
              max={new Date().toISOString().split("T")[0]}
              onChange={e => handleChange("fechaNac", e.target.value)}
            />
            {form.fechaNac && edad !== null && !errors.fechaNac && (
              <div style={{ fontSize: 12, color: "var(--ixfo-blue)", marginTop: 4 }}>
                ✓ {edad} años{esMenor ? " — Menor de edad, requiere acompañante" : ""}
              </div>
            )}
            {errors.fechaNac && <div className="ferr">⚠ {errors.fechaNac}</div>}
          </div>
        </div>

        <FormField name="email" label="Email" type="email" placeholder="juan@email.com"
          value={form.email} onChange={handleChange} error={errors.email} />

        {/* Teléfono — solo caracteres válidos */}
        <div className="fg">
          <label>WhatsApp</label>
          <input
            type="tel" placeholder="+54 9 376 123-4567"
            value={form.whatsapp}
            onChange={e => {
              const v = e.target.value.replace(/[^\d+\s\-()\.]/g, "");
              handleChange("whatsapp", v);
            }}
          />
          {errors.whatsapp && <div className="ferr">⚠ {errors.whatsapp}</div>}
        </div>

        <div className="fg">
          <label>Ciudad de residencia</label>
          <select value={form.ciudad} onChange={e => handleChange("ciudad", e.target.value)}>
            <option value="">Seleccioná tu ciudad</option>
            <option>Posadas</option>
            <option>Garupá</option>
            <option>Otra localidad</option>
          </select>
          {errors.ciudad && <div className="ferr">⚠ {errors.ciudad}</div>}
        </div>

        <div className="fg">
          <label>¿Sos cliente IXFO?</label>
          <select value={form.clienteIxfo} onChange={e => handleChange("clienteIxfo", e.target.value)}>
            <option value="">Seleccioná una opción</option>
            <option value="si">Sí, soy cliente IXFO</option>
            <option value="no">No, aún no soy cliente</option>
          </select>
          {errors.clienteIxfo && <div className="ferr">⚠ {errors.clienteIxfo}</div>}
        </div>

        {/* Aviso menor de edad */}
        {esMenor && (
          <div className="msg mi" style={{ marginBottom: 16 }}>
            ⚠️ <strong>Menor de edad ({edad} años):</strong> el padre/madre/tutor debe acompañarte durante todo el evento y presentar el <strong>Anexo I firmado</strong>. La ausencia del adulto responsable implica descalificación automática.
          </div>
        )}

        {/* Aviso personas no elegibles */}
        <div style={{ padding: "10px 14px", borderRadius: "var(--r)",
          background: "rgba(255,103,0,.07)", border: "1px solid rgba(255,103,0,.2)",
          fontSize: 12, color: "var(--tx)", lineHeight: 1.6, marginBottom: 16 }}>
          <strong style={{ color: "var(--ixfo-orange)" }}>⚠️ No pueden participar:</strong>{" "}
          empleados de IXFO y sus familiares directos, personal de empresas contratistas vinculadas al torneo,
          personal de agencias de publicidad o marketing del evento, empleados y propietarios de los locales sede,
          ni sus familiares directos. Residentes en Argentina únicamente.{" "}
          <button onClick={() => setShowReglamento(true)}
            style={{ background: "none", border: "none", color: "var(--ixfo-blue)",
              textDecoration: "underline", cursor: "pointer", fontSize: 12,
              fontFamily: "var(--fb)", padding: 0 }}>
            Ver reglamento completo
          </button>
        </div>

        <hr />

        {/* Términos */}
        <div style={{ fontFamily: "var(--fd)", fontSize: 11, fontWeight: 700, color: "var(--mu)", letterSpacing: 1, textTransform: "uppercase", margin: "14px 0 12px" }}>
          Términos y Condiciones
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--tx)", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
            <input type="checkbox" checked={checks.bases}
              onChange={e => setChecks(p => ({ ...p, bases: e.target.checked }))}
              style={{ width: "auto", marginTop: 2, accentColor: "var(--ixfo-blue)", flexShrink: 0 }} />
            <span>
              He leído y acepto las{" "}
              <button onClick={() => setShowReglamento(true)} style={{ background: "none", border: "none", color: "var(--ixfo-blue)", textDecoration: "underline", cursor: "pointer", fontSize: 13, fontFamily: "var(--fb)", padding: 0 }}>
                Bases y Condiciones del Mundialito IXFO 2026
              </button>.{" "}
              <strong style={{ color: "var(--re)" }}>*</strong>
            </span>
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--tx)", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
            <input type="checkbox" checked={checks.imagen}
              onChange={e => setChecks(p => ({ ...p, imagen: e.target.checked }))}
              style={{ width: "auto", marginTop: 2, accentColor: "var(--ixfo-blue)", flexShrink: 0 }} />
            <span>
              Autorizo a IXFO el uso de mi imagen, voz y nombre con fines promocionales (Anexo II), sin compensación económica, por 2 años.{" "}
              <strong style={{ color: "var(--re)" }}>*</strong>
            </span>
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--mu)", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
            <input type="checkbox" checked={form.novedades}
              onChange={e => handleChange("novedades", e.target.checked)}
              style={{ width: "auto", marginTop: 2, accentColor: "var(--ixfo-blue)", flexShrink: 0 }} />
            <span>Quiero recibir novedades y promociones de IXFO. <em>(Opcional)</em></span>
          </label>
        </div>

        {checkErr && (
          <div className="msg me" style={{ marginBottom: 12 }}>
            ⚠ Debés aceptar las Bases y la autorización de imagen para continuar.
          </div>
        )}
        {submitError && (
          <div className="msg me" style={{ marginBottom: 12 }}>⚠ {submitError}</div>
        )}

        <div style={{ fontSize: 11, color: "var(--mu)", marginBottom: 14 }}>
          <strong style={{ color: "var(--re)" }}>*</strong> Campos obligatorios.
        </div>

        {/* ── Documentos — ANTES del botón para que los vean ── */}
        <div style={{ padding: "14px 16px", borderRadius: "var(--r)",
          background: "rgba(0,154,222,.07)", border: "1px solid rgba(0,154,222,.25)",
          marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 800,
            textTransform: "uppercase", color: "var(--ixfo-blue)", marginBottom: 8 }}>
            📥 Descargá los documentos antes del evento
          </div>
          <div style={{ fontSize: 12, color: "var(--mu)", marginBottom: 10, lineHeight: 1.5 }}>
            Para agilizar el check-in traélos impresos y firmados. Si no podés, tendremos copias en la sede.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {esMenor && (
              <a href={ANEXO1_PDF_B64} download="Anexo_I_Autorizacion_Menores_MundialitoIXFO.pdf"
                className="btn btn-go btn-sm" style={{ fontSize: 12 }}>
                📄 Anexo I – Menores <span style={{ opacity: .7 }}>(Obligatorio)</span>
              </a>
            )}
            <a href={ANEXO2_PDF_B64} download="Anexo_II_Uso_de_Imagen_MundialitoIXFO.pdf"
              className="btn btn-out btn-sm" style={{ fontSize: 12 }}>
              📄 Anexo II – Uso de imagen <span style={{ opacity: .7 }}>(Obligatorio)</span>
            </a>
          </div>
        </div>

        <button className="btn btn-go btn-full btn-lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "⏳ Guardando..." : "✅ Completar Inscripción"}
        </button>
      </div>




    </div>
  );
}


/* ────────── SORTEOS (PÚBLICO) ────────── */
function SorteosView({ torneos, participants }) {
  const [selId, setSelId] = useState(1);
  const torneo = torneos.find(t => t.id === selId);

  if (!torneo) return null;
  const hasSorteo = torneo.titulares.length > 0;
  const hasEquipos = Object.keys(torneo.equipos).length > 0;

  return (
    <div className="sec">
      <div className="sh">
        <div className="st">🎲 Sorteos</div>
        <div className="ss">Transparencia total — todos los sorteos son públicos y verificables</div>
      </div>

      <div className="tos">
        {torneos.map(t => (
          <button key={t.id} className={`to-btn${t.isGranFinal ? " gf" : ""}${selId === t.id ? " on" : ""}`} onClick={() => setSelId(t.id)}>
            {t.isGranFinal ? "🏆" : `#${t.id}`} {t.nombre.replace("Clasificatorio ", "Clas. ")}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="fxb" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 900, textTransform: "uppercase" }}>{torneo.nombre}</div>
            <div style={{ fontSize: 14, color: "var(--mu)", marginTop: 4 }}>
                📅 {torneo.fecha} · 📍 {torneo.sede}{torneo.direccionSede ? ` — ${torneo.direccionSede}` : ""} · ⏰ 15:00–19:00 hs
              </div>
          </div>
          {hasSorteo ? <span className="badge b-gr">✅ Sorteado</span> : <span className="badge b-mu">⏳ Pendiente</span>}
        </div>
      </div>

      {!hasSorteo && (
        <div className="empty">
          <div className="empty-ico">🎲</div>
          <div className="empty-t">Sorteo Pendiente</div>
          <div className="empty-s">Los participantes de este torneo aún no fueron sorteados. El sorteo se realiza en vivo 48 hs antes del evento.</div>
        </div>
      )}

      {hasSorteo && (
        <>
          {/* TITULARES */}
          <div style={{ marginBottom: 32 }}>
            <div className="fxb" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800, textTransform: "uppercase" }}>
                ✅ Titulares <span className="gr">({torneo.titulares.length})</span>
              </div>
              {hasEquipos && <span className="badge b-gr">Equipos sorteados</span>}
            </div>
            <div className="g4">
              {torneo.titulares.map((pid, i) => {
                const p = getParticipant(participants, pid);
                const eq = torneo.equipos[pid];
                const equipo = EQUIPOS_FIFA_2026.find(e => e.nombre === eq);
                return (
                  <div key={pid} className={`sc tit${!p ? " sup" : ""}`}>
                    <div className="sc-lbl">Titular #{i + 1}</div>
                    <div className="sc-name">{p ? pName(p) : "Participante removido"}</div>
                    {eq && <><div className="sc-flag"><FlagImg iso={equipo?.iso} size={36} /></div><div className="sc-team">{eq}</div></>}
                    {!eq && hasEquipos && <div className="sc-team" style={{ color: "var(--mu)" }}>Sin equipo</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUPLENTES */}
          {torneo.suplentes.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800, textTransform: "uppercase", marginBottom: 16 }}>
                ⚠️ Suplentes <span style={{ color: "var(--mu)" }}>({torneo.suplentes.length})</span>
              </div>
              <div className="g4">
                {torneo.suplentes.map((pid, i) => {
                  const p = getParticipant(participants, pid);
                  return (
                    <div key={pid} className="sc sup">
                      <div className="sc-lbl">Suplente #{i + 1}</div>
                      <div className="sc-name">{p ? pName(p) : "Participante removido"}</div>
                      <div style={{ fontSize: 12, color: "var(--mu)" }}>En espera de confirmación</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ────────── RESULTADOS (PÚBLICO) ────────── */
function ResultadosView({ torneos, participants }) {
  const [selId, setSelId] = useState(1);
  const torneo = torneos.find(t => t.id === selId);

  return (
    <div className="sec">
      <div className="sh">
        <div className="st">🏆 Resultados</div>
        <div className="ss">Brackets y ganadores por torneo</div>
      </div>

      <div className="tos">
        {torneos.map(t => (
          <button key={t.id} className={`to-btn${t.isGranFinal ? " gf" : ""}${selId === t.id ? " on" : ""}`} onClick={() => setSelId(t.id)}>
            {t.isGranFinal ? "🏆" : `#${t.id}`} {t.nombre.replace("Clasificatorio ", "C.")}
          </button>
        ))}
      </div>

      {torneo && <BracketView torneo={torneo} participants={participants} readonly
        fmtScore={(m) => {
          if (m.s1 === "" || m.s2 === "" || m.s1 == null) return null;
          let txt = `${m.s1} - ${m.s2}`;
          if (m.et) txt += " (GdO)";
          else if (m.pen) {
            txt += (m.pen1 !== "" && m.pen2 !== "" && m.pen1 != null)
              ? ` (Pen. ${m.pen1}-${m.pen2})` : " (Pen.)";
          }
          return txt;
        }} />}
    </div>
  );
}

function BracketView({ torneo, participants, readonly, onOpenMatch, fmtScore }) {
  const gf = !!torneo.isGranFinal;
  const rounds = gf
    ? [["cuartos", "Cuartos"], ["semis", "Semis"], ["final", "Final"]]
    : [["octavos", "Octavos"], ["cuartos", "Cuartos"], ["semis", "Semis"], ["final", "Final"]];

  const hasBracket = gf
    ? torneo.bracket?.cuartos?.[0]?.p1 !== undefined
    : torneo.bracket?.octavos?.[0]?.p1 !== undefined;

  if (!hasBracket || torneo.titulares.length === 0) {
    return (
      <div className="empty">
        <div className="empty-ico">📊</div>
        <div className="empty-t">Bracket no disponible</div>
        <div className="empty-s">El bracket se genera automáticamente al realizar el sorteo de participantes.</div>
      </div>
    );
  }

  const champion = torneo.campeon ? getParticipant(participants, torneo.campeon) : null;
  const champEq = torneo.equipos[torneo.campeon];
  const champEquipo = EQUIPOS_FIFA_2026.find(e => e.nombre === champEq);

  return (
    <>
      {champion && (
        <div className="champ" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 4, lineHeight: 1,
            filter: "drop-shadow(0 2px 8px rgba(255,103,0,.6))" }}>🏆</div>
          <div className="champ-lbl" style={{ marginBottom: 8 }}>Campeón {torneo.nombre}</div>
          <div className="champ-name">{pName(champion)}</div>
          {champEq && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, marginTop: 10 }}>
              <FlagImg iso={champEquipo?.iso} size={36} />
              <span style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 700,
                color: "rgba(255,255,255,.9)", letterSpacing: 1 }}>
                {champEq}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="bwrap">
        <div className="bracket" style={{ gap: 0 }}>
          {rounds.map(([rk, rl], ri) => {
            const matches = torneo.bracket[rk] || [];
            return (
              <div key={rk} className="brnd" style={{ flex: 1, minWidth: 170 }}>
                <div className="brnd-t">{rl} ({matches.length})</div>
                <div className="bmatches" style={{ justifyContent: matches.length === 1 ? "center" : "space-around" }}>
                  {matches.map((m, mi) => {
                    const p1 = getParticipant(participants, m.p1);
                    const p2 = getParticipant(participants, m.p2);
                    const e1 = torneo.equipos[m.p1];
                    const e2 = torneo.equipos[m.p2];
                    return (
                      <div key={mi} className="bmatch">
                        {[{ pid: m.p1, p: p1, eq: e1 }, { pid: m.p2, p: p2, eq: e2 }].map(({ pid, p, eq }, si) => {
                          const isWin = m.g === pid;
                          const isLos = m.g && m.g !== pid;
                          return (
                            <div key={si}
                              className={`bp${isWin ? " win" : isLos ? " los" : ""}`}
                              onClick={() => !readonly && onOpenMatch && m.p1 && m.p2 && onOpenMatch(rk, mi, m)}
                              title={!readonly && m.p1 && m.p2 ? "Clic para cargar resultado" : ""}
                              style={{ cursor: !readonly && m.p1 && m.p2 ? "pointer" : "default" }}
                            >
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>
                                {p ? `${p.nombre} ${p.apellido[0]}.` : (pid ? "?" : "TBD")}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                                {eq && <FlagImg iso={EQUIPOS_FIFA_2026.find(e => e.nombre === eq)?.iso} size={16} style={{ borderRadius: 2 }} />}
                                {isWin && <span className="check">✓</span>}
                              </div>
                            </div>
                          );
                        })}
                      {/* Score display */}
                      {fmtScore && fmtScore(m) && (
                        <div style={{
                          textAlign: "center", fontSize: 11, fontWeight: 700,
                          fontFamily: "var(--fd)", letterSpacing: .5,
                          padding: "3px 6px",
                          color: "var(--ixfo-blue)",
                          borderTop: "1px solid var(--bo)",
                          background: "rgba(0,154,222,.05)",
                        }}>
                          {fmtScore(m)}
                        </div>
                      )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ────────── ADMIN ────────── */

// Roles: "admin" = acceso total | "operator" = solo sorteos y resultados
/* ── ADMIN TOAST — notificación flotante global ── */
function AdminToast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [msg, onDone]);

  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, minWidth: 280, maxWidth: 480,
      background: msg.type === "e" ? "var(--re)" : "var(--ixfo-blue)",
      color: "#fff", borderRadius: "var(--r2)",
      padding: "14px 24px", boxShadow: "0 8px 32px rgba(0,0,0,.4)",
      display: "flex", alignItems: "center", gap: 12,
      fontFamily: "var(--fb)", fontSize: 14, fontWeight: 600,
      animation: "toastIn .25s ease",
    }}>
      <span style={{ fontSize: 20 }}>{msg.type === "e" ? "⚠️" : "✅"}</span>
      <span style={{ flex: 1 }}>{msg.text}</span>
      <button onClick={onDone} style={{ background: "none", border: "none",
        color: "rgba(255,255,255,.7)", cursor: "pointer", fontSize: 18, padding: 0 }}>✕</button>
    </div>
  );
}

function AdminView({ torneos, setTorneos, participants, setParticipants, cfg, setCfg }) {
  const [role, setRole] = useState(null);   // null | "admin" | "operator"
  const [pw, setPw]     = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [tab, setTab]   = useState("sorteos");
  const [toast, setToast] = useState(null); // { text, type }

  const showToast = useCallback((text, type = "s", goTab = null) => {
    setToast({ text, type });
    if (goTab) setTimeout(() => setTab(goTab), 1200);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const handleLogin = () => {
    const adminPwd    = cfg.adminPassword    || "IXFO2026";
    const operatorPwd = cfg.operatorPassword || "OPERADOR2026";
    if (pw === adminPwd) {
      setRole("admin"); setTab("inscriptos"); setPwErr(false);
    } else if (pw === operatorPwd) {
      setRole("operator"); setTab("sorteos"); setPwErr(false);
    } else {
      setPwErr(true);
    }
  };

  if (!role) return (
    <div className="fxc" style={{ minHeight: "80vh", padding: 20 }}>
      <div className="mo-b" style={{ maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚙️</div>
          <div className="mo-t" style={{ textAlign: "center" }}>Panel de Control</div>
          <div className="mo-s" style={{ textAlign: "center" }}>
            Mundialito IXFO 2026 — Ingresá con tu contraseña
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { ico: "🔑", label: "Administrador",  desc: "Acceso total" },
            { ico: "🎮", label: "Operador",        desc: "Sorteos y resultados" },
          ].map(({ ico, label, desc }) => (
            <div key={label} style={{
              padding: "12px 14px", borderRadius: "var(--r)",
              border: "1px solid var(--bo)", background: "var(--bg2)", textAlign: "center",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{ico}</div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 800,
                textTransform: "uppercase", color: "var(--tx)" }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--mu)", marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>

        <div className="fg">
          <label>Contraseña</label>
          <input type="password" placeholder="••••••••••" value={pw}
            onChange={e => { setPw(e.target.value); setPwErr(false); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoFocus />
          {pwErr && <div className="ferr">⚠ Contraseña incorrecta</div>}
        </div>
        <button className="btn btn-full btn-lg"
          style={{ background: "var(--ixfo-blue)", color: "#fff" }}
          onClick={handleLogin}>
          Ingresar
        </button>
      </div>
    </div>
  );

  const allTabs = [
    { id: "inscriptos", label: "👥 Inscriptos",  roles: ["admin"] },
    { id: "sorteos",    label: "🎲 Sorteos",     roles: ["admin", "operator"] },
    { id: "resultados", label: "📊 Resultados",  roles: ["admin", "operator"] },
    { id: "config",     label: "⚙️ Config",      roles: ["admin"] },
  ].filter(t => t.roles.includes(role));

  return (
    <div>
      {/* Toast flotante global */}
      <AdminToast msg={toast} onDone={hideToast} />

      <div style={{ padding: "20px 20px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div className="fxb" style={{ flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="st">⚙️ Panel de Control</div>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`badge ${role === "admin" ? "b-bl" : "b-go"}`}>
                {role === "admin" ? "🔑 Administrador" : "🎮 Operador"}
              </span>
              <span style={{ fontSize: 12, color: "var(--mu)" }}>
                {role === "admin"
                  ? "Acceso completo — inscriptos, sorteos, resultados y configuración"
                  : "Acceso limitado — sorteos y resultados solamente"}
              </span>
            </div>
          </div>
          <button className="btn btn-out btn-sm"
            onClick={() => { setRole(null); setPw(""); setTab("sorteos"); }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="atabs">
        {allTabs.map(({ id, label }) => (
          <button key={id} className={`atab${tab === id ? " on" : ""}`}
            onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {tab === "inscriptos" && role === "admin" &&
          <TabInscriptos participants={participants} setParticipants={setParticipants}
            showToast={showToast} />}
        {tab === "sorteos" &&
          <TabSorteos torneos={torneos} setTorneos={setTorneos}
            participants={participants} showToast={showToast} cfg={cfg} role={role} />}
        {tab === "resultados" &&
          <TabResultados torneos={torneos} setTorneos={setTorneos}
            participants={participants} showToast={showToast} />}
        {tab === "config" && role === "admin" &&
          <TabConfig cfg={cfg} setCfg={setCfg} torneos={torneos}
            setTorneos={setTorneos} setParticipants={setParticipants}
            showToast={showToast} goTab={setTab} />}
      </div>
    </div>
  );
}


/* ── STAT CARD — métrica admin (fuera de TabInscriptos para evitar re-mount) ── */
function Stat({ n, label, color }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "12px 8px" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 32, fontWeight: 900,
        color: color || "var(--tx)", lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10, color: "var(--mu)", textTransform: "uppercase",
        letterSpacing: .5, marginTop: 4, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

/* ── TAB: INSCRIPTOS ── */
function TabInscriptos({ participants, setParticipants, showToast }) {
  const [filter, setFilter]       = useState("");
  const [ciudad, setCiudad]       = useState("");
  const [soloMenores, setSoloMenores] = useState(false);
  const [msg, setMsg]             = useState(null);

  const filtered = participants.filter(p => {
    if (ciudad && p.ciudad !== ciudad) return false;
    if (soloMenores && parseInt(p.edad) >= 18) return false;
    const q = filter.toLowerCase();
    return !q || pName(p).toLowerCase().includes(q) || (p.dni||"").includes(q) || (p.email||"").toLowerCase().includes(q);
  });

  const del = async (id) => {
    if (!confirm("¿Eliminar este inscripto?")) return;
    await apiDelete("/participants/" + id);
  };

  const delAll = async () => {
    if (!confirm("¿Eliminar TODOS los inscriptos? Esta acción no se puede deshacer.")) return;
    await apiDelete("/participants");
    setMsg("Todos los inscriptos fueron eliminados.");
    setTimeout(() => setMsg(null), 3000);
    if (showToast) showToast("Todos los inscriptos fueron eliminados", "e");
  };

  // ── Exportar CSV ──
  const exportCSV = () => {
    const headers = ["#","Nombre","Apellido","DNI","Fecha Nac.","Edad","Email","WhatsApp","Ciudad","Cliente IXFO","Novedades","Fecha Inscripción"];
    const rows = participants.map((p, i) => [
      i + 1,
      p.nombre || "", p.apellido || "", p.dni || "",
      p.fechaNac || "", p.edad || "",
      p.email || "", p.whatsapp || "", p.ciudad || "",
      p.clienteIxfo === "si" ? "Sí" : "No",
      p.novedades ? "Sí" : "No",
      p.fechaInscripcion ? new Date(p.fechaInscripcion).toLocaleString("es-AR") : "",
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `Inscriptos_MundialitoIXFO_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ── Métricas ──
  const total    = participants.length;
  const menores  = participants.filter(p => parseInt(p.edad) < 18).length;
  const mayores  = total - menores;
  const clientes = participants.filter(p => p.clienteIxfo === "si").length;
  const noClientes = total - clientes;
  const posadas  = participants.filter(p => p.ciudad === "Posadas").length;
  const garupa   = participants.filter(p => p.ciudad === "Garupá").length;
  const otros    = participants.filter(p => p.ciudad === "Otra localidad").length;
  const novedades = participants.filter(p => p.novedades).length;

  return (
    <div>
      {/* ── Métricas Admin ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10, marginBottom: 24 }}>
        <Stat n={total}      label="Total inscriptos"    color="var(--ixfo-blue)" />
        <Stat n={menores}    label="Menores de 18"       color="var(--ixfo-orange)" />
        <Stat n={mayores}    label="Mayores de 18"       color="var(--tx)" />
        <Stat n={clientes}   label="Clientes IXFO"       color="var(--ixfo-blue)" />
        <Stat n={noClientes} label="No clientes"         color="var(--mu)" />
        <Stat n={posadas}    label="Posadas"             color="var(--tx)" />
        <Stat n={garupa}     label="Garupá"              color="var(--tx)" />
        <Stat n={otros}      label="Otras localidades"   color="var(--mu)" />
        <Stat n={novedades}  label="Aceptan novedades"   color="var(--gr2)" />
      </div>

      {/* ── Toolbar ── */}
      <div className="fxb gap12" style={{ flexWrap: "wrap", marginBottom: 16 }}>
        <div className="fx gap8" style={{ flexWrap: "wrap", flex: 1 }}>
          <input placeholder="🔍 Nombre, DNI o email..." value={filter}
            onChange={e => setFilter(e.target.value)} style={{ maxWidth: 260 }} />
          <select value={ciudad} onChange={e => setCiudad(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="">Todas las ciudades</option>
            <option>Posadas</option><option>Garupá</option><option>Otra localidad</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, margin: 0,
            textTransform: "none", fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={soloMenores}
              onChange={e => setSoloMenores(e.target.checked)} style={{ width: "auto" }} />
            Solo menores
          </label>
        </div>
        <div className="fx gap8" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-bl btn-sm" onClick={exportCSV} disabled={total === 0}>
            📊 Exportar CSV ({total})
          </button>
          <button className="btn btn-re btn-sm" onClick={delAll}>🗑️ Borrar todos</button>
        </div>
      </div>

      {msg && <div className="msg ms">{msg}</div>}
      <div style={{ fontSize: 13, color: "var(--mu)", marginBottom: 12 }}>
        Mostrando <strong>{filtered.length}</strong> de <strong>{total}</strong> inscriptos
      </div>

      {total === 0 ? (
        <div className="empty">
          <div className="empty-ico">👥</div>
          <div className="empty-t">Sin inscriptos</div>
          <div className="empty-s">Los inscriptos aparecerán aquí cuando se registren.</div>
        </div>
      ) : (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Nombre</th><th>DNI</th><th>Fecha Nac.</th><th>Edad</th>
                <th>Email</th><th>WhatsApp</th><th>Ciudad</th>
                <th>Cliente</th><th>Novedades</th><th>Inscripto</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ color: "var(--mu)" }}>{participants.indexOf(p) + 1}</td>
                  <td>
                    <strong>{pName(p)}</strong>
                    {parseInt(p.edad) < 18 && <span className="badge b-go" style={{ fontSize: 9, marginLeft: 6 }}>MENOR</span>}
                  </td>
                  <td style={{ fontFamily: "monospace" }}>{p.dni}</td>
                  <td style={{ fontSize: 12 }}>{p.fechaNac || "—"}</td>
                  <td style={{ textAlign: "center" }}>{p.edad || "—"}</td>
                  <td style={{ fontSize: 12 }}>{p.email}</td>
                  <td style={{ fontSize: 12 }}>{p.whatsapp}</td>
                  <td>{p.ciudad}</td>
                  <td style={{ textAlign: "center" }}>
                    {p.clienteIxfo === "si"
                      ? <span className="badge b-bl">⚡ Sí</span>
                      : <span className="badge b-mu">No</span>}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {p.novedades ? <span style={{ color: "var(--gr2)" }}>✓</span> : <span style={{ color: "var(--mu)" }}>—</span>}
                  </td>
                  <td style={{ fontSize: 11, color: "var(--mu)", whiteSpace: "nowrap" }}>
                    {p.fechaInscripcion ? new Date(p.fechaInscripcion).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td><button className="btn btn-re btn-sm" onClick={() => del(p.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


/* ── TAB: SORTEOS ADMIN ── */
/* ── EMAIL SEND PANEL — botones de notificación en TabSorteos ── */
function EmailSendPanel({ torneo, participants, cfg }) {
  const [statusSorteo, setStatusSorteo] = useState(null);
  const [statusEquipo, setStatusEquipo] = useState(null);
  const [progress, setProgress]         = useState({ done: 0, total: 0 });
  const [log, setLog]                   = useState([]);

  if (!torneo.titulares || torneo.titulares.length === 0) return null;

  const hasSorteo  = torneo.titulares.length > 0;
  const hasEquipos = Object.keys(torneo.equipos || {}).length > 0;
  const smtpOk     = cfg.smtpHost && cfg.smtpUser && cfg.smtpPass;

  const sendEmails = async (type) => {
    const setStatus = type === "sorteo" ? setStatusSorteo : setStatusEquipo;
    setStatus("sending"); setLog([]); setProgress({ done: 0, total: 0 });

    // Armamos lista de destinatarios
    // Gran Final: solo titulares con equipo asignado
    const allIds = type === "granfinal"
      ? torneo.titulares
      : [...torneo.titulares, ...(torneo.suplentes || [])];
    const lista = allIds.map(id => {
      const p = participants.find(x => x.id === id);
      if (!p || !p.email) return null;
      const esTitular = torneo.titulares.includes(id);
      const equipo    = torneo.equipos?.[id] || null;
      if (type === "granfinal" && !equipo) return null; // GF requiere equipo
      return { id, nombre: p.nombre, apellido: p.apellido, email: p.email,
               edad: p.edad, esTitular, equipo };
    }).filter(Boolean);

    if (lista.length === 0) { setStatus("error"); setLog(["Sin emails válidos"]); return; }

    setProgress({ done: 0, total: lista.length });

    try {
      const r = await fetch(`/api/email/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtp: { host: cfg.smtpHost, port: parseInt(cfg.smtpPort || 587),
                  user: cfg.smtpUser, password: cfg.smtpPass,
                  from_email: cfg.smtpFrom, from_name: cfg.smtpFromName },
          torneo: { nombre: torneo.nombre, fecha: torneo.fecha,
                    sede: torneo.sede, direccionSede: torneo.direccionSede || "",
                    id: torneo.id },
          destinatarios: lista,
          whatsapp: cfg.whatsapp || "",
          // PDFs adjuntos (solo en email de seleccionados)
          ...(type === "sorteo" ? {
            anexo1_b64: ANEXO1_PDF_B64,
            anexo2_b64: ANEXO2_PDF_B64,
          } : {}),
        }),
      });

      const data = await r.json();
      if (r.ok) {
        setStatus("ok");
        setProgress({ done: data.enviados, total: lista.length });
        setLog(data.log || []);
      } else {
        setStatus("error");
        setLog([data.detail || "Error en el servidor"]);
      }
    } catch(e) {
      setStatus("error");
      setLog(["No se pudo conectar al servidor: " + e.message]);
    }
  };

  return (
    <div className="card" style={{ marginTop: 20,
      borderColor: "rgba(0,154,222,.3)", background: "rgba(0,154,222,.04)" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 800,
        textTransform: "uppercase", color: "var(--ixfo-blue)", marginBottom: 10 }}>
        📧 Notificaciones por Email
      </div>

      {!smtpOk && (
        <div style={{ fontSize: 12, color: "var(--ixfo-orange)", marginBottom: 10 }}>
          ⚠️ Configurá el SMTP en Admin → Config antes de enviar emails.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        {!torneo.isGranFinal && (
          <button className="btn btn-bl btn-sm"
            disabled={!hasSorteo || !smtpOk || statusSorteo === "sending"}
            onClick={() => sendEmails("sorteo")}>
            {statusSorteo === "sending" ? "⏳ Enviando..." : "📨 Notificar seleccionados"}
          </button>
        )}
        {!torneo.isGranFinal && (
          <button className="btn btn-gr btn-sm"
            style={{ background: hasEquipos ? "var(--ixfo-blue)" : undefined }}
            disabled={!hasEquipos || !smtpOk || statusEquipo === "sending"}
            onClick={() => sendEmails("equipo")}>
            {statusEquipo === "sending" ? "⏳ Enviando..." : "⚽ Notificar equipos asignados"}
          </button>
        )}
        {torneo.isGranFinal && (
          <button className="btn btn-sm"
            style={{ background: hasEquipos && smtpOk ? "var(--ixfo-orange)" : undefined,
                     color: hasEquipos && smtpOk ? "#fff" : undefined,
                     border: "1px solid var(--ixfo-orange)" }}
            disabled={!hasEquipos || !smtpOk || statusEquipo === "sending"}
            onClick={() => sendEmails("granfinal")}>
            {statusEquipo === "sending" ? "⏳ Enviando..." : "📢 Recordatorio Gran Final"}
          </button>
        )}
      </div>

      {/* Progreso */}
      {(statusSorteo === "sending" || statusEquipo === "sending") && progress.total > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: "var(--mu)", marginBottom: 4 }}>
            Enviando {progress.done}/{progress.total} — 1 por segundo para evitar spam...
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "var(--bo)", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--ixfo-blue)", borderRadius: 2,
              width: `${progress.total ? (progress.done/progress.total)*100 : 0}%`,
              transition: "width .3s" }} />
          </div>
        </div>
      )}

      {/* Resultado */}
      {(statusSorteo === "ok" || statusEquipo === "ok") && (
        <div style={{ padding: "10px 14px", borderRadius: "var(--r)",
          background: "rgba(0,154,222,.1)", border: "1px solid rgba(0,154,222,.3)",
          fontSize: 13, color: "var(--ixfo-blue)", fontWeight: 700 }}>
          ✅ {progress.done} de {progress.total} emails enviados correctamente
          {progress.done < progress.total && (
            <span style={{ color: "var(--ixfo-orange)", marginLeft: 8 }}>
              ({progress.total - progress.done} fallaron — ver detalle abajo)
            </span>
          )}
        </div>
      )}
      {(statusSorteo === "error" || statusEquipo === "error") && (
        <div style={{ padding: "10px 14px", borderRadius: "var(--r)",
          background: "rgba(255,51,51,.08)", border: "1px solid rgba(255,51,51,.3)",
          fontSize: 13, color: "var(--re)", fontWeight: 700 }}>
          ❌ Error al enviar: {log[0]}
        </div>
      )}
      {log.length > 0 && (statusSorteo === "ok" || statusEquipo === "ok") && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 11, color: "var(--mu)", cursor: "pointer" }}>
            Ver detalle de envíos ({log.length})
          </summary>
          <div style={{ marginTop: 6, maxHeight: 100, overflowY: "auto",
            fontSize: 11, color: "var(--mu)", fontFamily: "monospace",
            background: "var(--bg2)", borderRadius: "var(--r)", padding: "8px 10px" }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: l.startsWith("OK") ? "var(--gr2)" : "var(--re)" }}>
                {l}
              </div>
            ))}
          </div>
        </details>
      )}

      <div style={{ fontSize: 11, color: "var(--mu)", marginTop: 8 }}>
        Los emails se envían de a 1 por segundo —{" "}
        {torneo.isGranFinal
          ? `${torneo.titulares.length} finalistas con equipo asignado`
          : `${torneo.titulares.length + (torneo.suplentes?.length || 0)} destinatarios (titulares + suplentes)`}
      </div>
    </div>
  );
}

function TabSorteos({ torneos, setTorneos, participants, showToast, cfg, role }) {
  const [selId, setSelId] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [revealed, setRevealed] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | participants | equipos
  const [msg, setMsg] = useState(null);

  const torneo = torneos.find(t => t.id === selId);
  if (!torneo) return null;

  const hasPart = torneo.titulares.length > 0;
  const hasEq = Object.keys(torneo.equipos).length > 0;

  const showMsg = (m, type = "s") => { setMsg({ m, type }); setTimeout(() => setMsg(null), 4000); if (showToast) showToast(m, type); };

  // SORTEO DE PARTICIPANTES
  // Reglas de elegibilidad:
  // 1. Ciudad: Posadas → jugadores de Posadas + Otra localidad; Garupá → Garupá + Otra
  // 2. No repetir: excluir jugadores ya sorteados como titulares en CUALQUIER otro torneo
  // 3. DNI único: la inscripción ya lo valida, pero filtramos por si acaso

  // IDs de jugadores ya sorteados en otros torneos (titulares confirmados)
  const yasorteados = new Set(
    torneos
      .filter(t => t.id !== selId && !t.isGranFinal) // otros clasificatorios
      .flatMap(t => t.titulares)
  );

  const elegibles = torneo.isGranFinal
    ? participants  // Gran Final: los campeones se cargan manualmente
    : participants.filter(p =>
        (p.ciudad === torneo.sede || p.ciudad === "Otra localidad") &&
        !yasorteados.has(p.id)  // excluir ya sorteados en otros torneos
      );

  // Cuántos fueron excluidos por ya estar sorteados (para mostrarlo en UI)
  const yasorteadosCount = torneo.isGranFinal ? 0 : participants.filter(p =>
    (p.ciudad === torneo.sede || p.ciudad === "Otra localidad") && yasorteados.has(p.id)
  ).length;

  const sortearParticipantes = async () => {
    if (elegibles.length < 16) {
      showMsg(
        `Necesitás al menos 16 inscriptos de ${torneo.sede} para sortear. Actualmente hay ${elegibles.length}.`,
        "e"
      );
      return;
    }
    if (!confirm("¿Realizar el sorteo de participantes? Esta acción reemplazará el sorteo anterior para este torneo.")) return;

    setDrawing(true);
    setPhase("participants");
    setRevealed([]);

    const shuffled = shuffle(elegibles);
    const titulares = shuffled.slice(0, 16).map(p => p.id);
    const suplentes = shuffled.slice(16, 21).map(p => p.id);
    const all = [...titulares.map(id => ({ id, type: "tit" })), ...suplentes.map(id => ({ id, type: "sup" }))];

    for (let i = 0; i < all.length; i++) {
      await new Promise(r => setTimeout(r, 110));
      setRevealed(prev => [...prev, all[i]]);
    }

    const bracket = torneo.isGranFinal ? setupGFBracket(titulares) : setupBracketPlayers(titulares);

    setTorneos(prev => prev.map(t => t.id === selId
      ? { ...t, titulares, suplentes, equipos: {}, campeon: null, bracket, estado: "sorteado" }
      : t
    ));

    setDrawing(false);
    setPhase("idle");
    showMsg("✅ Sorteo de participantes completado. Ahora podés sortear los equipos.");
  };

  // SORTEO DE EQUIPOS
  const sortearEquipos = async () => {
    if (!hasPart) { showMsg("Primero realizá el sorteo de participantes.", "e"); return; }
    if (!confirm("¿Sortear equipos FIFA 2026 para los participantes?")) return;

    setDrawing(true);
    setPhase("equipos");
    setRevealed([]);

    const equiposMezclados = shuffle(EQUIPOS_FIFA_2026);
    const nuevosEquipos = {};
    const titulares = torneo.isGranFinal ? torneo.titulares : torneo.titulares;

    for (let i = 0; i < titulares.length; i++) {
      await new Promise(r => setTimeout(r, 130));
      nuevosEquipos[titulares[i]] = equiposMezclados[i % EQUIPOS_FIFA_2026.length].nombre;
      setRevealed(prev => [...prev, titulares[i]]);
    }

    setTorneos(prev => prev.map(t => t.id === selId ? { ...t, equipos: nuevosEquipos } : t));
    setDrawing(false);
    setPhase("idle");
    showMsg("✅ Equipos sorteados exitosamente.");
  };

  // GRAN FINAL: cargar campeones automáticamente
  const cargarCampeones = () => {
    const campeones = torneos.filter(t => !t.isGranFinal && t.campeon).map(t => t.campeon);
    if (campeones.length === 0) { showMsg("No hay clasificados aún.", "e"); return; }
    if (campeones.length < 8) { showMsg(`Solo hay ${campeones.length} de 8 clasificados. Podés igualmente sortear los equipos.`, "i"); }
    const bracket = setupGFBracket(campeones);
    setTorneos(prev => prev.map(t => t.id === 9 ? { ...t, titulares: campeones, suplentes: [], bracket, estado: "sorteado" } : t));
    showMsg(`✅ ${campeones.length} campeones cargados en la Gran Final.`);
    setRevealed(campeones);
    setPhase("idle");
  };

  const limpiar = () => {
    if (!confirm("¿Limpiar el sorteo de este torneo?")) return;
    setTorneos(prev => prev.map(t => t.id === selId ? { ...t, titulares: [], suplentes: [], equipos: {}, campeon: null, bracket: mkBracket(t.isGranFinal), estado: "pendiente" } : t));
    setRevealed([]);
    setPhase("idle");
    showMsg("Sorteo reiniciado.");
  };

  const getEquipo = (pid) => {
    const eq = torneo.equipos[pid];
    const e = EQUIPOS_FIFA_2026.find(x => x.nombre === eq);
    return e || null;
  };

  const displayList = phase === "participants"
    ? revealed
    : (phase === "equipos" ? revealed.map(pid => ({ id: pid, type: "tit" })) : []);

  return (
    <div>
      <div className="tos">
        {torneos.map(t => (
          <button key={t.id} className={`to-btn${t.isGranFinal ? " gf" : ""}${selId === t.id ? " on" : ""}`}
            onClick={() => { setSelId(t.id); setRevealed([]); setPhase("idle"); }}>
            {t.isGranFinal ? "🏆" : `#${t.id}`} {t.nombre.replace("Clasificatorio ", "C.")}
          </button>
        ))}
      </div>

      {msg && <div className={`msg m${msg.type}`}>{msg.m}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="fxb" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 900, textTransform: "uppercase" }}>{torneo.nombre}</div>
            <div style={{ fontSize: 13, color: "var(--mu)" }}>{torneo.fecha} · {torneo.sede}</div>
            <div style={{ fontSize: 13, marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {hasPart ? <span className="badge b-gr">✅ Participantes sorteados ({torneo.titulares.length})</span> : <span className="badge b-mu">⏳ Sin sorteo</span>}
              {hasEq && <span className="badge b-bl">⚽ Equipos asignados</span>}
              {!torneo.isGranFinal && (
                <span className="badge b-mu">👥 {elegibles.length} elegibles de {torneo.sede}</span>
              )}
              {yasorteadosCount > 0 && (
                <span className="badge b-go" title="Ya participaron en otro clasificatorio">🔒 {yasorteadosCount} excluidos (ya sorteados)</span>
              )}
            </div>
          </div>
          <div className="fx gap8" style={{ flexWrap: "wrap" }}>
            {!torneo.isGranFinal && (
              <button className="btn btn-gr" onClick={sortearParticipantes} disabled={drawing || elegibles.length < 16 || torneo.estado === "finalizado" || !!torneo.campeon}>
                🎲 {hasPart ? "Re-Sortear Participantes" : "Sortear Participantes"}
              </button>
            )}
            {torneo.isGranFinal && (
              <button className="btn btn-go" onClick={cargarCampeones} disabled={drawing}>
                🏆 Cargar Campeones
              </button>
            )}
            <button className="btn btn-bl" onClick={sortearEquipos}
              disabled={drawing || !hasPart
                || (torneo.isGranFinal && torneo.titulares.length < 8)
                || (!torneo.isGranFinal && (torneo.estado === "finalizado" || !!torneo.campeon))}
              title={torneo.isGranFinal && torneo.titulares.length < 8
                ? `Faltan ${8 - torneo.titulares.length} campeones para completar la Gran Final`
                : ""}>
              ⚽ {hasEq ? "Re-Sortear Equipos" : "Sortear Equipos"}
            </button>
            {hasPart && <button className="btn btn-out btn-sm" onClick={limpiar} disabled={torneo.estado === "finalizado" || !!torneo.campeon}>🗑 Limpiar</button>}
          </div>
        </div>
        {torneo.isGranFinal && torneo.titulares.length < 8 && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: "var(--r)",
            background: "rgba(255,103,0,.1)", border: "1px solid rgba(255,103,0,.35)",
            fontSize: 13, color: "var(--ixfo-orange)" }}>
            ⚠️ <strong>Gran Final:</strong> hay {torneo.titulares.length} de 8 campeones cargados.
            {torneo.titulares.length === 0
              ? " Hacé clic en 'Cargar Campeones' para cargarlos automáticamente."
              : ` Faltan ${8 - torneo.titulares.length} clasificatorios por finalizar.`}
            El sorteo de equipos se habilitará cuando estén los 8.
          </div>
        )}
        {elegibles.length < 16 && !torneo.isGranFinal && (
          <div className="msg me" style={{ marginTop: 12, marginBottom: 0 }}>
            ⚠️ Necesitás al menos 16 inscriptos elegibles de <strong>{torneo.sede}</strong>. Actualmente hay <strong>{elegibles.length}</strong> disponibles
            ({participants.filter(p => p.ciudad === torneo.sede).length} de {torneo.sede}
            + {participants.filter(p => p.ciudad === "Otra localidad").length} de otras localidades
            {yasorteadosCount > 0 && <span>, <strong>{yasorteadosCount} excluidos</strong> por ya haber sido sorteados en otro torneo</span>}).
          </div>
        )}
      </div>

      {/* ANIMACIÓN DE SORTEO EN VIVO */}
      {(drawing || (phase === "idle" && revealed.length > 0 && !hasPart)) && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, textTransform: "uppercase", marginBottom: 12, color: "var(--gr)" }}>
            {drawing ? "🎲 Sorteando en vivo..." : "Resultado del sorteo"}
          </div>
        </div>
      )}

      {/* LISTA TITULARES CON EQUIPOS */}
      {hasPart && (
        <div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, textTransform: "uppercase", marginBottom: 12 }}>
            Titulares ({torneo.titulares.length})
          </div>
          <div className="g4" style={{ marginBottom: 24 }}>
            {torneo.titulares.map((pid, i) => {
              const p = getParticipant(participants, pid);
              const eq = getEquipo(pid);
              const isRevealing = phase === "equipos" && !torneo.equipos[pid];
              return (
                <div key={pid} className={`sc tit${isRevealing ? " glow" : ""}`}>
                  <div className="sc-lbl">Titular #{i + 1}</div>
                  <div className="sc-name">{p ? pName(p) : "Removido"}</div>
                  {eq && <><div className="sc-flag"><FlagImg iso={eq.iso} size={36} /></div><div className="sc-team">{eq.nombre}</div></>}
                  {!eq && hasEq && <div className="sc-team" style={{ color: "var(--mu)" }}>—</div>}
                </div>
              );
            })}
          </div>

          {torneo.suplentes.length > 0 && (
            <>
              <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, textTransform: "uppercase", marginBottom: 12, color: "var(--mu)" }}>
                Suplentes ({torneo.suplentes.length})
              </div>
              <div className="g4">
                {torneo.suplentes.map((pid, i) => {
                  const p = getParticipant(participants, pid);
                  return (
                    <div key={pid} className="sc sup">
                      <div className="sc-lbl">Suplente #{i + 1}</div>
                      <div className="sc-name">{p ? pName(p) : "Removido"}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <EmailSendPanel torneo={torneo} participants={participants} cfg={cfg || {}} />
    </div>
  );
}


/* ── PLAYER CARD — tarjeta de jugador en modal de resultado ── */
function PlayerCard({ player, iso, equipo, score, onScore, isWinner }) {
  return (
    <div style={{
      flex: 1, padding: "14px 10px", borderRadius: "var(--r)",
      border: `2px solid ${isWinner ? "var(--ixfo-blue)" : "var(--bo)"}`,
      background: isWinner ? "rgba(0,154,222,.08)" : "var(--bg2)",
      textAlign: "center", transition: "all .2s",
    }}>
      <div style={{ marginBottom: 4 }}><FlagImg iso={iso} size={24} /></div>
      <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 800,
        textTransform: "uppercase", marginBottom: 2,
        color: isWinner ? "var(--ixfo-blue)" : "var(--tx)" }}>
        {player ? `${player.nombre} ${player.apellido[0]}.` : "TBD"}
      </div>
      <div style={{ fontSize: 11, color: "var(--mu)", marginBottom: 10 }}>{equipo}</div>
      <input type="text" inputMode="numeric" placeholder="0"
        value={score} onChange={e => onScore(e.target.value.replace(/\D/g, "").slice(0,2))}
        style={{ width: 60, textAlign: "center", fontSize: 26,
          fontFamily: "var(--fd)", fontWeight: 900, padding: "6px 0",
          border: `1px solid ${isWinner ? "var(--ixfo-blue)" : "var(--bo2)"}`,
          borderRadius: "var(--r)", background: "var(--bg)" }} />
    </div>
  );
}

function MatchModal({ match, torneo, participants, onSave, onClose }) {
  const p1  = getParticipant(participants, match.p1);
  const p2  = getParticipant(participants, match.p2);
  const eq1 = torneo.equipos?.[match.p1] || "";
  const eq2 = torneo.equipos?.[match.p2] || "";
  const iso1 = EQUIPOS_FIFA_2026.find(e => e.nombre === eq1)?.iso || "";
  const iso2 = EQUIPOS_FIFA_2026.find(e => e.nombre === eq2)?.iso || "";

  const [s1,   setS1]   = useState(match.s1  ?? "");
  const [s2,   setS2]   = useState(match.s2  ?? "");
  // Prórroga: null = no hubo, "p1"/"p2" = quién ganó por Gol de Oro
  const [et,   setEt]   = useState(match.et  ?? null);
  // Penales: null = no hubo, "p1"/"p2" = quién ganó
  const [pen,  setPen]  = useState(match.pen ?? null);
  // Marcador de penales
  const [pen1, setPen1] = useState(match.pen1 ?? "");
  const [pen2, setPen2] = useState(match.pen2 ?? "");
  // Modo desempate: null | "et" (prórroga/GdO) | "pen" (penales directos)
  const [modo, setModo] = useState(
    match.pen ? "pen" : match.et ? "et" : null
  );

  const gs1 = parseInt(s1) || 0;
  const gs2 = parseInt(s2) || 0;
  const hayMarcador = s1 !== "" && s2 !== "";
  const empate = hayMarcador && gs1 === gs2;

  // Ganador según resultado
  const winner = (() => {
    if (!hayMarcador) return null;
    if (gs1 > gs2) return "p1";
    if (gs2 > gs1) return "p2";
    // Empate — desempate
    if (modo === "et") return et || null;
    if (modo === "pen") return pen || null;
    return null;
  })();
  const winnerId = winner === "p1" ? match.p1 : winner === "p2" ? match.p2 : null;

  const canSave = (() => {
    if (!hayMarcador) return false;
    if (!empate) return true;                          // gana alguien en tiempo normal
    if (!modo) return false;                           // empate sin elegir desempate
    if (modo === "et" && !et) return false;            // GdO sin elegir ganador
    if (modo === "pen" && !pen) return false;          // penales sin elegir ganador
    return true;
  })();

  return (
    <div className="mo" onClick={onClose}>
      <div className="mo-b" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="fxb" style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 900, textTransform: "uppercase" }}>
            📋 Cargar Resultado
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none",
            color: "var(--mu)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        {/* Marcador principal */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
          <PlayerCard side="p1" player={p1} iso={iso1} equipo={eq1}
            score={s1} onScore={v => { setS1(v); setEt(null); setPen(null); setModo(null); }}
            isWinner={winner === "p1"} />
          <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 900,
            color: "var(--mu)", textAlign: "center", flexShrink: 0 }}>VS</div>
          <PlayerCard side="p2" player={p2} iso={iso2} equipo={eq2}
            score={s2} onScore={v => { setS2(v); setEt(null); setPen(null); setModo(null); }}
            isWinner={winner === "p2"} />
        </div>

        {/* Desempate — solo si empate en tiempo normal */}
        {empate && (
          <div className="card" style={{ marginBottom: 12, borderColor: "var(--ixfo-orange)" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 11, fontWeight: 700,
              color: "var(--ixfo-orange)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              ⚡ Empate — ¿Cómo se resolvió?
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: modo ? 12 : 0 }}>
              <button onClick={() => { setModo("et"); setPen(null); setPen1(""); setPen2(""); }}
                className="btn btn-sm" style={{ flex: 1, justifyContent: "center",
                  background: modo === "et" ? "var(--ixfo-orange)" : "var(--bg2)",
                  color: modo === "et" ? "#fff" : "var(--tx)",
                  border: `1px solid ${modo === "et" ? "var(--ixfo-orange)" : "var(--bo)"}` }}>
                ⚡ Gol de Oro
              </button>
              <button onClick={() => { setModo("pen"); setEt(null); }}
                className="btn btn-sm" style={{ flex: 1, justifyContent: "center",
                  background: modo === "pen" ? "var(--re)" : "var(--bg2)",
                  color: modo === "pen" ? "#fff" : "var(--tx)",
                  border: `1px solid ${modo === "pen" ? "var(--re)" : "var(--bo)"}` }}>
                🥅 Penales
              </button>
            </div>

            {/* Gol de Oro — elegir quién convirtió */}
            {modo === "et" && (
              <div>
                <div style={{ fontSize: 11, color: "var(--mu)", marginBottom: 8 }}>
                  ¿Quién convirtió el Gol de Oro?
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["p1", p1], ["p2", p2]].map(([side, player]) => (
                    <button key={side} onClick={() => setEt(side)}
                      className="btn btn-sm" style={{ flex: 1, justifyContent: "center",
                        background: et === side ? "var(--ixfo-orange)" : "var(--bg2)",
                        color: et === side ? "#fff" : "var(--tx)",
                        border: `1px solid ${et === side ? "var(--ixfo-orange)" : "var(--bo)"}` }}>
                      {player ? `${player.nombre} ${player.apellido[0]}.` : "TBD"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Penales — marcador + ganador */}
            {modo === "pen" && (
              <div>
                <div style={{ fontSize: 11, color: "var(--mu)", marginBottom: 8 }}>
                  Resultado de la tanda de penales:
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--mu)", marginBottom: 4 }}>
                      {p1 ? `${p1.nombre} ${p1.apellido[0]}.` : "J1"}
                    </div>
                    <input type="text" inputMode="numeric" placeholder="0"
                      value={pen1} onChange={e => setPen1(e.target.value.replace(/\D/g, "").slice(0,2))}
                      style={{ width: 52, textAlign: "center", fontSize: 22,
                        fontFamily: "var(--fd)", fontWeight: 900, padding: "4px 0",
                        border: "1px solid var(--bo2)", borderRadius: "var(--r)",
                        background: "var(--bg)" }} />
                  </div>
                  <div style={{ fontFamily: "var(--fd)", fontSize: 16, color: "var(--mu)" }}>—</div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--mu)", marginBottom: 4 }}>
                      {p2 ? `${p2.nombre} ${p2.apellido[0]}.` : "J2"}
                    </div>
                    <input type="text" inputMode="numeric" placeholder="0"
                      value={pen2} onChange={e => setPen2(e.target.value.replace(/\D/g, "").slice(0,2))}
                      style={{ width: 52, textAlign: "center", fontSize: 22,
                        fontFamily: "var(--fd)", fontWeight: 900, padding: "4px 0",
                        border: "1px solid var(--bo2)", borderRadius: "var(--r)",
                        background: "var(--bg)" }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--mu)", marginBottom: 8 }}>
                  Ganador de la tanda:
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["p1", p1], ["p2", p2]].map(([side, player]) => (
                    <button key={side} onClick={() => setPen(side)}
                      className="btn btn-sm" style={{ flex: 1, justifyContent: "center",
                        background: pen === side ? "var(--re)" : "var(--bg2)",
                        color: pen === side ? "#fff" : "var(--tx)",
                        border: `1px solid ${pen === side ? "var(--re)" : "var(--bo)"}` }}>
                      {player ? `${player.nombre} ${player.apellido[0]}.` : "TBD"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resumen del resultado */}
        {winnerId && (
          <div style={{ padding: "10px 14px", borderRadius: "var(--r)",
            background: "rgba(0,154,222,.1)", border: "1px solid rgba(0,154,222,.3)",
            fontSize: 13, color: "var(--ixfo-blue)", marginBottom: 12, textAlign: "center" }}>
            🏆 <strong>{pName(getParticipant(participants, winnerId))}</strong>
            {" "}
            {!empate && `${gs1} - ${gs2}`}
            {empate && modo === "et" && et && `${gs1} - ${gs2} (Gol de Oro)`}
            {empate && modo === "pen" && pen && pen1 !== "" && pen2 !== ""
              ? ` ${gs1} - ${gs2} (Pen. ${pen1} - ${pen2})`
              : empate && modo === "pen" && pen ? ` ${gs1} - ${gs2} (Penales)` : ""}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-out" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button className="btn btn-gr" style={{ flex: 2, background: "var(--ixfo-blue)", color: "#fff" }}
            disabled={!canSave || !winnerId}
            onClick={() => onSave({
              s1, s2,
              et:   modo === "et"  ? et  : null,
              pen:  modo === "pen" ? pen : null,
              pen1: modo === "pen" ? pen1 : "",
              pen2: modo === "pen" ? pen2 : "",
              winner: winnerId,
            })}>
            💾 Guardar resultado
          </button>
        </div>

        {!canSave && hayMarcador && empate && (
          <div style={{ fontSize: 12, color: "var(--ixfo-orange)", marginTop: 8, textAlign: "center" }}>
            {!modo && "⚠ Empate — elegí si se resolvió por Gol de Oro o Penales"}
            {modo === "et" && !et && "⚠ Elegí quién convirtió el Gol de Oro"}
            {modo === "pen" && !pen && "⚠ Elegí el ganador de la tanda de penales"}
          </div>
        )}
      </div>
    </div>
  );
}


function TabResultados({ torneos, setTorneos, participants, showToast }) {
  const [selId, setSelId]     = useState(1);
  const [msg, setMsg]         = useState(null);
  const [activeMatch, setActiveMatch] = useState(null); // { round, matchIdx, match }
  const torneo = torneos.find(t => t.id === selId);
  const showMsg = (m, type = "s") => { setMsg({ m, type }); setTimeout(() => setMsg(null), 3000); if (showToast) showToast(m, type); };

  const handleOpenMatch = (round, matchIdx, match) => {
    if (!match.p1 || !match.p2) return; // no abrir si no hay jugadores
    setActiveMatch({ round, matchIdx, match });
  };

  const handleSaveResult = ({ s1, s2, et, pen, pen1, pen2, winner }) => {
    const { round, matchIdx } = activeMatch;
    setTorneos(prev => prev.map(t => {
      if (t.id !== selId) return t;
      const b = dp(t.bracket);
      b[round][matchIdx] = { ...b[round][matchIdx], s1, s2, et, pen, pen1: pen1||'', pen2: pen2||'', g: winner };
      // Propagar ganador a siguiente ronda
      const rounds = t.isGranFinal
        ? ["cuartos", "semis", "final"]
        : ["octavos", "cuartos", "semis", "final"];
      const ri = rounds.indexOf(round);
      if (ri < rounds.length - 1) {
        const nr = rounds[ri + 1];
        const ni = Math.floor(matchIdx / 2);
        if (matchIdx % 2 === 0) b[nr][ni].p1 = winner;
        else                     b[nr][ni].p2 = winner;
      }
      const isFinal  = round === "final";
      const campeon  = isFinal ? winner : t.campeon;
      const estado   = isFinal ? "finalizado" : t.estado === "pendiente" ? "sorteado" : t.estado;
      return { ...t, bracket: b, campeon, estado };
    }));
    const p = getParticipant(participants, winner);
    showMsg(`✅ ${pName(p)} — resultado guardado`);
    setActiveMatch(null);
  };

  const resetBracket = () => {
    if (!confirm("¿Reiniciar el bracket de este torneo?")) return;
    setTorneos(prev => prev.map(t => {
      if (t.id !== selId) return t;
      const b = t.isGranFinal ? setupGFBracket(t.titulares) : setupBracketPlayers(t.titulares);
      return { ...t, bracket: b, campeon: null, estado: t.titulares.length > 0 ? "sorteado" : "pendiente" };
    }));
    showMsg("Bracket reiniciado.");
  };

  // Formato de resultado para mostrar en la tarjeta
  const fmtScore = (match) => {
    if (match.s1 === "" || match.s2 === "" || match.s1 == null) return null;
    let txt = `${match.s1} - ${match.s2}`;
    if (match.et) txt += " (GdO)";
    else if (match.pen) {
      // Mostrar marcador de penales si está disponible
      txt += (match.pen1 !== "" && match.pen2 !== "" && match.pen1 != null)
        ? ` (Pen. ${match.pen1}-${match.pen2})`
        : " (Pen.)";
    }
    return txt;
  };

  return (
    <div>
      {activeMatch && torneo && (
        <MatchModal
          match={activeMatch.match}
          torneo={torneo}
          participants={participants}
          onSave={handleSaveResult}
          onClose={() => setActiveMatch(null)}
        />
      )}

      <div className="tos">
        {torneos.map(t => (
          <button key={t.id}
            className={`to-btn${t.isGranFinal ? " gf" : ""}${selId === t.id ? " on" : ""}`}
            onClick={() => setSelId(t.id)}>
            {t.isGranFinal ? "🏆" : `#${t.id}`} {t.nombre.replace("Clasificatorio ", "C.")}
            {t.estado === "finalizado" && " ✓"}
          </button>
        ))}
      </div>

      {msg && <div className={`msg m${msg.type}`}>{msg.m}</div>}

      {torneo && (
        <>
          <div className="fxb gap12" style={{ flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 900, textTransform: "uppercase" }}>
                {torneo.nombre}
              </div>
              <div style={{ fontSize: 13, color: "var(--mu)" }}>
                {torneo.fecha} · {torneo.sede}{torneo.direccionSede ? ` — ${torneo.direccionSede}` : ""} · Clic en un partido para cargar el resultado
              </div>
            </div>
            {torneo.titulares.length > 0 && (
              <button className="btn btn-out btn-sm" onClick={resetBracket}>↺ Reiniciar bracket</button>
            )}
          </div>
          <BracketView
            torneo={torneo}
            participants={participants}
            readonly={false}
            onOpenMatch={handleOpenMatch}
            fmtScore={fmtScore}
          />
        </>
      )}
    </div>
  );
}


/* ── TAB: CONFIG ── */
/* ── CfgInput — input de configuración (fuera de TabConfig para evitar re-mount) ── */
function CfgInput({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="fg">
      <label>{label}</label>
      <input type={type} value={value ?? ""} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} />
    </div>
  );
}

/* ── EMAIL TEST BUTTON ── */
function EmailTestButton({ cfg }) {
  const [status, setStatus] = useState(null); // null | "sending" | "ok" | "error"
  const [detail, setDetail] = useState("");

  const test = async () => {
    setStatus("sending"); setDetail("");
    try {
      const r = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost: cfg.smtpHost, smtpPort: cfg.smtpPort,
          smtpUser: cfg.smtpUser, smtpPass: cfg.smtpPass,
          smtpFrom: cfg.smtpFrom, smtpFromName: cfg.smtpFromName,
        }),
      });
      const data = await r.json();
      if (r.ok) { setStatus("ok"); setDetail("Email de prueba enviado a " + cfg.smtpUser); }
      else       { setStatus("error"); setDetail(data.detail || "Error desconocido"); }
    } catch(e) {
      setStatus("error"); setDetail("No se pudo conectar al servidor");
    }
  };

  return (
    <div>
      <button className="btn btn-out btn-sm" onClick={test} disabled={status === "sending"}>
        {status === "sending" ? "⏳ Enviando..." : "📧 Enviar email de prueba"}
      </button>
      {status === "ok"    && <span style={{ marginLeft: 10, fontSize: 12, color: "var(--ixfo-blue)" }}>✅ {detail}</span>}
      {status === "error" && <span style={{ marginLeft: 10, fontSize: 12, color: "var(--re)" }}>❌ {detail}</span>}
    </div>
  );
}

function TabConfig({ cfg, setCfg, torneos, setTorneos, setParticipants, showToast, goTab }) {
  const [form, setForm] = useState({ ...CFG_DEFAULT, ...cfg });
  // Usa toast global del AdminView

  // Refs para contraseñas — inputs no controlados para evitar cursor saltando al final
  const refAdminPw    = useRef(null);
  const refOperatorPw = useRef(null);

  // Sync cuando cfg cambia desde otro dispositivo (SSE)
  useEffect(() => { setForm(() => ({ ...CFG_DEFAULT, ...cfg })); }, [cfg]);

  const setF = (n) => (val) => setForm(p => ({ ...p, [n]: val }));

  const save = () => {
    const adminPw    = refAdminPw.current?.value?.trim();
    const operatorPw = refOperatorPw.current?.value?.trim();
    const finalAdminPw    = adminPw    || form.adminPassword    || CFG_DEFAULT.adminPassword;
    const finalOperatorPw = operatorPw || form.operatorPassword || CFG_DEFAULT.operatorPassword;
    setCfg({ ...form, adminPassword: finalAdminPw, operatorPassword: finalOperatorPw });
    // Notifica y redirige al tab de inscriptos
    if (showToast) showToast("Configuración guardada correctamente", "s");
    if (goTab) setTimeout(() => goTab("inscriptos"), 1400);
  };

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Información del evento */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800, textTransform: "uppercase", marginBottom: 14 }}>
          🏢 Información del Evento
        </div>
        <CfgInput label="Nombre de la empresa" value={form.empresa} onChange={setF("empresa")} />
        <CfgInput label="Nombre del evento" value={form.evento} onChange={setF("evento")} />
        <CfgInput label="Tagline / subtítulo" value={form.tagline} onChange={setF("tagline")} />
        <CfgInput label="URL del logo (opcional)" placeholder="https://..." value={form.logoUrl} onChange={setF("logoUrl")} />
      </div>

      {/* Contacto */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800, textTransform: "uppercase", marginBottom: 14 }}>
          📱 Contacto y Redes
        </div>
        <CfgInput label="WhatsApp" placeholder="+54 9 376 000-0000" value={form.whatsapp} onChange={setF("whatsapp")} />
        <div className="fr">
          <CfgInput label="Instagram" placeholder="@ixfo.misiones" value={form.instagram} onChange={setF("instagram")} />
          <CfgInput label="Facebook" placeholder="IXFO Misiones" value={form.facebook} onChange={setF("facebook")} />
        </div>
      </div>

      {/* Seguridad — contraseñas */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800, textTransform: "uppercase", marginBottom: 14 }}>
          🔐 Contraseñas de Acceso
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}>
          {/* Admin */}
          <div style={{ padding: "14px", border: "1px solid var(--ixfo-blue)", borderRadius: "var(--r)", background: "rgba(0,154,222,.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>🔑</span>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: "var(--ixfo-blue)" }}>Administrador</div>
                <div style={{ fontSize: 11, color: "var(--mu)" }}>Acceso total al panel</div>
              </div>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label>Nueva contraseña Admin</label>
              <input
                ref={refAdminPw}
                type="password"
                placeholder="Dejar vacío para no cambiar"
                autoComplete="new-password"
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--mu)", marginTop: 4 }}>
              Actual: {(form.adminPassword || "").replace(/./g, "•")}
            </div>
          </div>

          {/* Operador */}
          <div style={{ padding: "14px", border: "1px solid var(--ixfo-orange)", borderRadius: "var(--r)", background: "rgba(255,103,0,.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>🎮</span>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: "var(--ixfo-orange)" }}>Operador</div>
                <div style={{ fontSize: 11, color: "var(--mu)" }}>Solo sorteos y resultados</div>
              </div>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label>Nueva contraseña Operador</label>
              <input
                ref={refOperatorPw}
                type="password"
                placeholder="Dejar vacío para no cambiar"
                autoComplete="new-password"
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--mu)", marginTop: 4 }}>
              Actual: {(form.operatorPassword || "").replace(/./g, "•")}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--mu)", marginTop: 8 }}>
          ⚠️ Guardá los cambios antes de cerrar sesión. El operador solo puede gestionar sorteos y resultados.
        </div>
      </div>

      {/* Modo En Vivo */}
      <div className="card" style={{
        marginBottom: 16,
        borderColor: form.modoLive ? "var(--ixfo-orange)" : "var(--bo)",
        background: form.modoLive ? "rgba(255,103,0,.06)" : "var(--su)"
      }}>
        <div className="fxb" style={{ flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800, textTransform: "uppercase",
              color: form.modoLive ? "var(--ixfo-orange)" : "var(--tx)", marginBottom: 4 }}>
              {form.modoLive ? "🔴 Modo en Vivo — ACTIVO" : "⚪ Modo en Vivo — Inactivo"}
            </div>
            <div style={{ fontSize: 12, color: "var(--mu)", lineHeight: 1.5 }}>
              Activalo durante los torneos. Los usuarios verán el indicador{" "}
              <strong style={{ color: "var(--ixfo-orange)" }}>EN VIVO</strong> en la app.
              Los datos se sincronizan en tiempo real entre todos los dispositivos.
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            textTransform: "none", letterSpacing: 0, fontSize: 14, fontWeight: 700,
            color: form.modoLive ? "var(--ixfo-orange)" : "var(--mu)", margin: 0 }}>
            <input type="checkbox" checked={!!form.modoLive}
              onChange={e => setForm(p => ({ ...p, modoLive: e.target.checked }))}
              style={{ width: "auto", accentColor: "var(--ixfo-orange)", transform: "scale(1.4)" }} />
            {form.modoLive ? "Desactivar" : "Activar"}
          </label>
        </div>
      </div>

      <button className="btn btn-gr btn-lg" onClick={save}>💾 Guardar cambios</button>

      <hr />

      {/* ── Configuración de Email SMTP ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800,
          textTransform: "uppercase", marginBottom: 4 }}>📧 Configuración de Email</div>
        {/* Selector rápido de proveedor */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Gmail", host: "smtp.gmail.com", port: "587" },
            { label: "Outlook / Hotmail", host: "smtp.office365.com", port: "587" },
            { label: "Hosting propio", host: "", port: "587" },
          ].map(({ label, host, port }) => (
            <button key={label} className="btn btn-out btn-sm"
              onClick={() => setForm(p => ({ ...p, smtpHost: host, smtpPort: port }))}>
              {label}
            </button>
          ))}
        </div>

        <div className="fr">
          <CfgInput label="Servidor SMTP (Host)" placeholder="smtp.gmail.com"
            value={form.smtpHost} onChange={setF("smtpHost")} />
          <CfgInput label="Puerto" placeholder="587"
            value={form.smtpPort} onChange={setF("smtpPort")} />
        </div>
        <CfgInput label="Usuario / Email de la cuenta" placeholder="tucuenta@gmail.com"
          value={form.smtpUser} onChange={setF("smtpUser")} />
        <div className="fg">
          <label>Contraseña de aplicación</label>
          <input type="password" placeholder="xxxx xxxx xxxx xxxx"
            defaultValue={form.smtpPass || ""}
            onBlur={e => setForm(p => ({ ...p, smtpPass: e.target.value }))}
            autoComplete="new-password" />
        </div>
        <div className="fr">
          <CfgInput label="Email remitente (From)" placeholder="tucuenta@gmail.com"
            value={form.smtpFrom} onChange={setF("smtpFrom")} />
          <CfgInput label="Nombre remitente" placeholder="Mundialito IXFO 2026"
            value={form.smtpFromName} onChange={setF("smtpFromName")} />
        </div>

        {/* Instrucciones Gmail */}
        {(form.smtpHost || "").includes("gmail") && (
          <div style={{ padding: "12px 14px", borderRadius: "var(--r)",
            background: "rgba(255,103,0,.07)", border: "1px solid rgba(255,103,0,.25)",
            fontSize: 12, color: "var(--tx)", lineHeight: 1.7, marginTop: 4 }}>
            <strong style={{ color: "var(--ixfo-orange)" }}>⚠️ Gmail requiere Contraseña de Aplicación:</strong><br/>
            1. Entrá a <strong>myaccount.google.com</strong><br/>
            2. Seguridad → Verificación en dos pasos (activala si no está)<br/>
            3. Seguridad → <strong>Contraseñas de aplicaciones</strong><br/>
            4. Seleccioná "Correo" → "Otro" → escribí "Mundialito" → Generar<br/>
            5. Copiá el código de 16 caracteres y pegalo en "Contraseña de aplicación" de arriba
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <EmailTestButton cfg={form} />
        </div>
      </div>

      <hr />

      {/* ── Editor de fechas de torneos ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800,
          textTransform: "uppercase", marginBottom: 4 }}>📅 Fechas y Sedes de Torneos</div>
        <div style={{ fontSize: 12, color: "var(--mu)", marginBottom: 14 }}>
          Modificá las fechas o sedes en caso de reprogramación. Los cambios se guardan con "Guardar cambios".
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {torneos.map((t, i) => (
            <div key={t.id} style={{
              display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 1fr", gap: 8,
              alignItems: "center", padding: "8px 10px", borderRadius: "var(--r)",
              background: "var(--bg2)", border: "1px solid var(--bo)",
            }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 900,
                color: t.isGranFinal ? "var(--ixfo-orange)" : "var(--mu2)" }}>
                {t.isGranFinal ? "🏆" : t.id}
              </div>
              <input
                value={t.nombre}
                onChange={e => setTorneos(prev => prev.map((x, j) => j === i ? { ...x, nombre: e.target.value } : x))}
                style={{ fontSize: 12, padding: "5px 8px" }}
              />
              <input
                value={t.fecha}
                onChange={e => setTorneos(prev => prev.map((x, j) => j === i ? { ...x, fecha: e.target.value } : x))}
                placeholder="Lunes 4 de Mayo"
                style={{ fontSize: 12, padding: "5px 8px" }}
              />
              <select
                value={t.sede}
                onChange={e => setTorneos(prev => prev.map((x, j) => j === i ? { ...x, sede: e.target.value } : x))}
                style={{ fontSize: 12, padding: "5px 8px" }}
              >
                <option>Posadas</option>
                <option>Garupá</option>
                <option>Otra sede</option>
              </select>
              <input
                value={t.direccionSede || ""}
                onChange={e => setTorneos(prev => prev.map((x, j) => j === i ? { ...x, direccionSede: e.target.value } : x))}
                placeholder="Nombre y dirección de la sede"
                style={{ fontSize: 12, padding: "5px 8px" }}
              />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--mu)", marginTop: 10 }}>
          Los cambios de fecha/sede se guardan automáticamente al hacer "Guardar cambios" arriba.
        </div>
      </div>

      <hr />

      {/* Zona de peligro */}
      <div className="card" style={{ borderColor: "var(--re)", marginTop: 20 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800, color: "var(--re)", textTransform: "uppercase", marginBottom: 12 }}>
          ⚠️ Zona de Peligro
        </div>
        <div className="fx gap8" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-re btn-sm" onClick={() => {
            if (!confirm("¿Reiniciar TODOS los torneos? Se perderán sorteos y resultados.")) return;
            const reset = TORNEOS_BASE.map(t => ({ ...t, bracket: mkBracket(!!t.isGranFinal) }));
            setTorneos(reset);
            if (showToast) showToast("Todos los torneos fueron reiniciados", "e");
          }}>🔄 Reiniciar torneos</button>
          <button className="btn btn-re btn-sm" onClick={() => {
            if (!confirm("¿Eliminar TODOS los inscriptos?")) return;
            setParticipants([]);
            if (showToast) showToast("Todos los inscriptos fueron eliminados", "e");
          }}>🗑️ Borrar inscriptos</button>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   APP PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState("inicio");
  const [participants, setParticipants] = useState([]);
  const [torneos, setTorneos] = useState(TORNEOS_BASE);
  const [cfg, setCfg] = useState(CFG_DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState("connecting"); // connecting | ok | error
  const isAdmin = view === "admin";

  // ── Carga inicial desde la API ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, t, c] = await Promise.all([
          apiGet("/participants"),
          apiGet("/torneos"),
          apiGet("/config"),
        ]);
        if (cancelled) return;
        if (Array.isArray(p)) setParticipants(p);
        if (Array.isArray(t) && t.length > 0) setTorneos(t);
        if (c && typeof c === "object" && Object.keys(c).length > 0) {
          // Asegura que contraseñas vacías en DB nunca reemplacen el default
          const safeCfg = {
            ...c,
            adminPassword:    c.adminPassword    || CFG_DEFAULT.adminPassword,
            operatorPassword: c.operatorPassword || CFG_DEFAULT.operatorPassword,
          };
          setCfg(prev => ({ ...CFG_DEFAULT, ...prev, ...safeCfg }));
        }
        setApiStatus("ok");
      } catch(e) {
        console.error("Error cargando datos:", e);
        setApiStatus("error");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── SSE — tiempo real: escucha cambios del servidor ──
  useEffect(() => {
    if (!loaded) return;
    let es;
    let retryTimeout;

    const connect = () => {
      es = new EventSource("/api/events");

      es.addEventListener("participants", e => {
        try { setParticipants(JSON.parse(e.data)); } catch {}
      });
      es.addEventListener("torneos", e => {
        try {
          const t = JSON.parse(e.data);
          if (Array.isArray(t) && t.length > 0) setTorneos(t);
        } catch {}
      });
      es.addEventListener("config", e => {
        try {
          const c = JSON.parse(e.data);
          if (c && typeof c === "object") setCfg(prev => ({ ...CFG_DEFAULT, ...prev, ...c }));
        } catch {}
      });
      es.onerror = () => {
        es.close();
        // Reconectar en 5 segundos si se pierde la conexión
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();
    return () => {
      if (es) es.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [loaded]);

  // ── Wrappers con escritura a la API ──

  const wrappedSetParticipants = useCallback((fn) => {
    // Solo usado para eliminación individual o masiva (inscripción va directo a la API)
    setParticipants(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      apiPut("/participants/bulk", next); // endpoint especial para reemplazar todo
      return next;
    });
  }, []);

  const wrappedSetTorneos = useCallback((fn) => {
    setTorneos(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      apiPut("/torneos", next);
      return next;
    });
  }, []);

  const wrappedSetCfg = useCallback((fn) => {
    setCfg(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      apiPut("/config", next);
      return next;
    });
  }, []);

  // ── Pantalla de carga ──
  if (!loaded) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "var(--bg)" }}>
      <style>{CSS}</style>
      <div style={{ fontSize: 52 }}>⚽</div>
      <div style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 900, letterSpacing: 2, color: "var(--tx)" }}>CARGANDO...</div>
      <div style={{ fontSize: 13, color: "var(--mu)" }}>Conectando con la base de datos...</div>
    </div>
  );

  const modoLive = cfg.modoLive;

  return (
    <div className="app">
      <style>{CSS}</style>
      <NavBar view={view} setView={setView} cfg={cfg} />

      {/* ── Barra de estado ── */}
      <div style={{
        background: apiStatus === "error" ? "rgba(255,51,51,.08)" : modoLive ? "rgba(255,103,0,.1)" : "var(--bg2)",
        borderBottom: `1px solid ${apiStatus === "error" ? "rgba(255,51,51,.3)" : modoLive ? "rgba(255,103,0,.3)" : "var(--bo)"}`,
        padding: "5px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {modoLive && apiStatus === "ok" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--fd)", fontSize: 11, fontWeight: 800, letterSpacing: 1, color: "var(--ixfo-orange)", textTransform: "uppercase" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ixfo-orange)", display: "inline-block", animation: "livePulse 1.2s infinite" }} />
              EN VIVO
            </span>
          )}
          <span style={{ fontSize: 11, color: apiStatus === "error" ? "var(--re)" : "var(--mu)" }}>
            {apiStatus === "ok"
              ? "🟢 Base de datos sincronizada — tiempo real activo"
              : "⚠️ Sin conexión al servidor — verificá que el backend esté corriendo"}
          </span>
        </div>
        {isAdmin && (
          <span style={{ fontSize: 11, color: "var(--ixfo-blue)", fontWeight: 700 }}>
            ⚙️ Admin — {modoLive ? "🔴 EN VIVO" : "Modo normal"}
          </span>
        )}
      </div>

      {view === "inicio" && (
        <InicioView cfg={cfg} torneos={torneos} participants={participants} setView={setView} />
      )}
      {view === "inscripcion" && (
        <InscripcionView participants={participants} setParticipants={wrappedSetParticipants} setView={setView} />
      )}
      {view === "sorteos" && (
        <SorteosView torneos={torneos} participants={participants} />
      )}
      {view === "resultados" && (
        <ResultadosView torneos={torneos} participants={participants} />
      )}
      {view === "admin" && (
        <AdminView
          torneos={torneos} setTorneos={wrappedSetTorneos}
          participants={participants} setParticipants={wrappedSetParticipants}
          cfg={cfg} setCfg={wrappedSetCfg}
        />
      )}
    </div>
  );
}
