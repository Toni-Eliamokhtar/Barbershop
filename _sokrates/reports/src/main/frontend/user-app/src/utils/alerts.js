import Swal from "sweetalert2";

export function showSuccessAlert({ title, text }) {
    return Swal.fire({
        icon: "success",
        title,
        text,
        confirmButtonColor: "#111",
    });
}

export function showErrorAlert({ title, text }) {
    return Swal.fire({
        icon: "error",
        title,
        text,
        confirmButtonColor: "#111",
    });
}
