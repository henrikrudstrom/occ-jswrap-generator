template<class T>
struct wrapper_for_type;

template<class T>
struct wrapped_type;

// #include <Geom_Point.hxx>
// #include "Pnt.h"
// template<> struct wrapper_for_type<gp_Pnt>{
//     typedef Pnt type;
// };
// template<> struct wrapped_type<Pnt>{
//     typedef gp_Pnt;
// };
#define CREATE_WRAPPER_TRAITS(TYPE, WRAPPER_TYPE) \
template<> struct wrapper_for_type<TYPE> { typedef WRAPPER_TYPE type; }; \
template<> struct wrapped_type<WRAPPER_TYPE> { typedef TYPE type; }; 
