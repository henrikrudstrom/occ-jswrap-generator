#ifndef WRAPPER_CLASS_TRAITS_H
#define WRAPPER_CLASS_TRAITS_H

#include <Standard_Real.hxx>
#include <Standard_Integer.hxx>
#include <Standard_Boolean.hxx>

template <class T>
struct wrapper_for_type;

template <class T>
struct wrapped_type;

template <>
struct wrapper_for_type<Standard_Real> {
    typedef double type;
};
template <>
struct wrapped_type<double> {
    typedef Standard_Real type;
    constexpr static const char * name = "Real";
};

template <>
struct wrapper_for_type<Standard_Integer> {
    typedef uint32_t type;
};
template <>
struct wrapped_type<uint32_t> {
    typedef Standard_Integer type;
    constexpr static const char * name = "Integer";
};

template <>
struct wrapper_for_type<Standard_Boolean> {
    typedef bool type;
};
template <>
struct wrapped_type<bool> {
    typedef Standard_Boolean type;
    constexpr static const char * name = "Boolean";
};

#endif // WRAPPER_CLASS_TRAITS_H
