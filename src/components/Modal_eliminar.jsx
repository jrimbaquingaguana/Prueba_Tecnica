import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/src/sweetalert2.scss"; // puedes usar tu theme

const MySwal = withReactContent(Swal);

/**
 * Función para mostrar modal de confirmación de eliminación
 * @param {Object} product Producto a eliminar
 * @param {Function} onConfirm Callback al confirmar
 */
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
      popup: "swal2-popup-custom",
      confirmButton: "swal2-confirm-custom",
      cancelButton: "swal2-cancel-custom",
    },
  });

  if (result.isConfirmed) {
    await onConfirm();
    MySwal.fire({
      icon: "success",
      title: "¡Eliminado!",
      text: `El producto "${product.title}" ha sido eliminado correctamente.`,
      timer: 2000,
      showConfirmButton: false,
    });
  }
};
