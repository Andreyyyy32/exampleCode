import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import isArray from "lodash/isArray";
import {
  BaseSelectChangePayload,
  OptionShape,
  Select,
  SelectProps,
} from "@core-components/select";
import {
  OwnProps as OptionListProps,
  SelectOptionsList,
} from "./select-option-list";
import {
  getFilteredBySearchSelectnOptions,
  isAllSelected,
  toggleValueInArray,
} from "select-search.utils";

export const GROUP_VALUE_PREFIX = "group-";

type SelectOptions = Omit<
  SelectProps,
  | "visibleOptions"
  | "showEmptyOptionsList"
  | "onOpen"
  | "optionListProps"
  | "OptionsList"
>;

export interface SelectSearchProps extends SelectOptions {
  //значение поля ввода инпута
  searchLabel?: string;
  contentWidth?: string;
  selected: string[] | string;
  options: OptionsShape[];
  onChange: (payload: BaseSelectChangePayload, keys?: string[]) => void;
  className?: string;
}

export const SelectSearch: React.FC<SelectWithSearchProps> = ({
  onChange,
  selected,
  options,
  contentWidth,
  placeholder = "Выберите значение",
  onBlur,
  multiple = false,
  searchLabel = "Поиск...",
  className,
  ...props
}) => {
  const [filteredOptions, setFilteredOptions] =
    useState<OptionShape[]>(options);
  const [searchField, setSearchField] = useState<string>("");

  const handleSearch = (
    _event: ChangeEvent<HTMLInputElement>,
    payload: { value: string }
  ) => {
    setSearchField(payload.value);
  };
  const handleChangeSearch = useCallback(() => {
    const selectedOptions = isArray(selected) ? selected : [selected];
    const newSelectOptions = getFilteredBySearchSelectnOptions(
      options,
      searchField,
      selectedOptions,
      multiple
    );

    setFilteredOptions(newSelectOptions);
  }, [options, searchField, selected, multiple]);

  useEffect(() => {
    handleChangeSearch();
  }, [handleChangeSearch]);

  const handleClearSearchField = useCallback(() => {
    setSearchField("");
    handleChangeSearch();
  }, [handleChangeSearch]);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLDivElement, Element>) => {
      if (onBlur) onBlur(e);
      handleClearSearchField();
    },
    [onBlur, handleClearSearchField]
  );
  const onCloseSelect = (payload: { open?: boolean; name?: string }) => {
    if (payload.open) return;
    handleClearSearchField();
  };

  const optionsListProps = useMemo(
    (): OptionsListProps => ({
      onChange: handleSearch,
      inputValue: searchField,
      onClear: handleClearSearchField,
      width: contentWidth,
      label: searchLabel,
      onChangeSelected: onChange,
      multiple,
    }),
    [
      searchField,
      handleClearSearchField,
      contentWidth,
      searchLabel,
      onChange,
      multiple,
    ]
  );
  const handleItemSelect = useCallback(
  (payload: BaseSelectChangePayload) => {
    const { initiator } = payload;
    const selectedOptions = isArray(selected) ? selected : [selected];

    if(!initiator){
      return;
    }
    const  isSelectGroup = initiator.key.startsWith(GROUP_VALUE_PREFIX);

    if(isSelectGroup) {
      const groupKey = initiator.key;
      const findGroupOption = options?.find((obj) => obj.key === groupKey)
      const groupContentKeys = findGroupOption?.value;

      const isAllChecked = isAllSelected(selectedOptions, groupContentKeys);

      if(isAllChecked){
        onChange(payload, selectedOptions.filter((key: string) =>
        !groupContentKeys?.includes(key))),
      } else {
        onChange(payload, Array.from(new Set(selectedOptions.concat(groupContentKeys))));
      }
    } else {
      const toggleOption = multiple
      ? toggleValueInArray(initiator.key, selectedOptions)
      : undefined;

      onChange(payload, toggleOption)
    }
  }, [multiple, onChange, options, selected])

return (
  <div className={ className }>
    <Select 
      {...props}
      options={ filteredOptions }
      OptionsList={ SelectOptionsList }
      OptionsListProps={ optionsListProps }
      onOpen={ onCloseSelect }
      onBlur={ handleBlur }
      showEmptyOptionsList={ true }
      placeholder={ placeholder }
      multiple={ multiple }
      onChange={ handleItemSelect }
      selected={ selected }
      />
  </div>
  )
}

export default SelectSearch;
