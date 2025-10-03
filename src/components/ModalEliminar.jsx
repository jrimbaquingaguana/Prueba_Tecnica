// src/components/ModalEliminar.jsx
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../styles/ModalEliminar.css"; // Solo importa tu CSS

const MySwal = withReactContent(Swal);

export const confirmDelete = async (product, onConfirm) => {
  const result = await MySwal.fire({
    title: `¿Eliminar "${product.title}"?`,
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "modal-content",       // Estilo del modal desde tu CSS
      confirmButton: "btn-confirm",
      cancelButton: "btn-cancel",
      backdrop: "modal-overlay",    // Fondo transparente con blur
    },
    showClass: {
      popup: "swal2-show",
      backdrop: "swal2-backdrop-show",
    },
    hideClass: {
      popup: "swal2-hide",
      backdrop: "swal2-backdrop-hide",
    },
    allowOutsideClick: false,
  });

  if (!result.isConfirmed) return;

  try {
    await onConfirm();

    await MySwal.fire({
      icon: "success",
      title: "¡Eliminado!",
      text: `El producto "${product.title}" ha sido eliminado correctamente.`,
      showConfirmButton: true,
      customClass: {
        popup: "modal-content",
        confirmButton: "btn-confirm",
        backdrop: "modal-overlay",
      },
      allowOutsideClick: false,
    });
  } catch (err) {
    await MySwal.fire({
      icon: "error",
      title: "Error",
      text: err.message || `No se pudo eliminar el producto "${product.title}".`,
      confirmButtonText: "Aceptar",
      customClass: {
        popup: "modal-content",
        confirmButton: "btn-confirm",
        backdrop: "modal-overlay",
      },
      allowOutsideClick: false,
    });
  }
};
