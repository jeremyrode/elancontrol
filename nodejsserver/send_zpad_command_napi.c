#include <node_api.h>
#include <stdio.h>

napi_value MyFunction(napi_env env, napi_callback_info info) {
  napi_status status;
  size_t argc = 2;
  int channel = 0;
  int command = 0;
  int return_code = 0;
  napi_value argv[2];
  printf("About to get cb info\n");
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Failed to parse arguments");
  }
  printf("About to get arg #1\n");
  status = napi_get_value_int32(env, argv[0], &channel);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Invalid channel was passed as argument");
  }
  printf("About to get arg #2\n");
  status = napi_get_value_int32(env, argv[1], &command);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Invalid command was passed as argument");
  }  
  napi_value my_return_code;
  printf("About to create return value\n");
  return_code = channel + command; //Test shell for API
  status = napi_create_int32(env, return_code, &my_return_code);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create return value");
  }
  printf("About to return\n");
  return my_return_code;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value fn;
  printf("About to Create Function\n");
  status = napi_create_function(env, NULL, 0, MyFunction, NULL, &fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function");
  }
  printf("About to set named property\n");
  status = napi_set_named_property(env, exports, "my_function", fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports");
  }

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
