/*
 * Plugin para gerenciar os fieldsets em forma de tabela
 * 
 * Escrito por Wilson Jr (wpjunior@lethus.com.br)
 * 31/01/2012
 *
 *
 */

(function ($) {
    var FieldSetTable = function (elem, options) {
        this._init(elem, options);
    };

    FieldSetTable.prototype = {
        constructor: FieldSetTable,
        ACTIONS_TEMPLATE: (
            '<td class="actions">'+
                '<a href="#" class="edit" title="Editar"><span class="ui-icon ui-icon-pencil"></span></a>'+
                '<a href="#" class="delete" title="Remover"><span class="ui-icon ui-icon-trash"></span></a>'+
                '</td>'),
        childElementSelector: 'input,select,textarea,label',

        _init: function (elem, options) {
            var _this = this;
            this._elem = $(elem);
            this._options = options;

            $('<table class="ui-widget-content ui-corner-all">'+
              '<thead class="ui-widget-header"><tr></tr></thead>'+
              '<tbody></tbody>'+
              '<tfoot><tr><td>'+
              '<a class="add_item" href="#"></a>'+
              '</td></tr></tfoot>'+
              '</table>').appendTo(this._elem);

            for (var _i=0; _i<options.tableTitles.length; _i+=1) {
                $('<th>'+options.tableTitles[_i]+'</th>').appendTo(this._elem.find('table thead tr'));
            }

            $('<th>'+options.actionLabel+'</th>').appendTo(this._elem.find('table thead tr'));

            this.totalForms = this._elem.find('#id_'+options.prefix+'-TOTAL_FORMS');
            this._elem.find('a.add_item')
                .text(options.addButton)
                .button({
                    icons: {
                        primary: "ui-icon-plus"
                    }})
                .click(function (e) {
                    e.preventDefault();
                    _this._addItem();
                    return false;
                });

            this._updateTable();
        },
        _updateTable: function () {
            var _this = this;

            var regex = new RegExp("^"+this._options.prefix+"\-form\-(\\d+)$");
            var tbody = this._elem.find('table tbody');
            
            tbody.empty();

            this._elem.find('div.forms div.formset-form').each(function (i, e) {
                var id = parseInt(regex.exec($(e).attr('id'))[1]);
                var tr = $('<tr></tr>');

                for (var _i=0; _i<_this._options.tableAttrs.length; _i+=1) {
                    var attr = _this._options.tableAttrs[_i];
                    var val = $(e).find('#id_'+_this._options.prefix+'-'+id+'-'+attr).val();
                    $('<td>'+val+'</td>').appendTo(tr);
                }
                $(_this.ACTIONS_TEMPLATE).appendTo(tr);
                tr.appendTo(tbody);

                tr.find('a.edit').click(function (e) {
                    e.preventDefault();
                    _this._updateItem(id);
                    return false;
                });

                tr.find('a.delete').click(function (e) {
                    e.preventDefault();
                    _this._deleteItem(id);
                    return false;
                });
            });
        },
        _addItem: function () {
            var _this = this;
            var html = this._elem.find('div.template').html();
            this._dialog = $('<div class="fieldset-dialog"><form>'+html+'</form></div>');
            this._dialog.find('form').validate({errorElement: "div"});

            this._dialog.dialog({
                title: this._options.addTitle,
                modal: true,
                buttons: {
                    "Adicionar": function () {
                        if (!_this._dialog.find('form').valid())
                             return;

                        $(this).dialog('destroy');
                        _this._dialog.remove();
                        _this._addForm(_this._cloneForm(_this._dialog.find('form')));
                    },
                    "Cancelar": function () {
                        $(this).dialog('destroy');
                        _this._dialog.remove();
                    }
                }
            });
        },
        _cloneForm: function (form) {
            var newForm = form.clone(true, true);
 
            var selects = form.find('select');
            newForm.find('select').each(function (i) {
                $(this).val(selects.eq(i).val());
            });

            return newForm;
        },
        _addForm: function (form) {
            var _this = this;

            var ndx = parseInt(this.totalForms.val());
            
            var elem = $('<div id="'+this._options.prefix+'-form-'+ndx+'" class="formset-form"></div>');
            elem.appendTo(this._elem.find('div.forms'));
            form.contents().appendTo(elem);

            elem.find('input,select,textarea').each(function (i, e) {
                var name = $(e).attr('name');

                $(e).attr('name', _this._options.prefix+'-'+ndx+'-'+name);
                $(e).attr('id', 'id_'+_this._options.prefix+'-'+ndx+'-'+name);

                elem.find('label[for="id_'+name+'"]').attr('for', 'id_'+_this._options.prefix+'-'+ndx+'-'+name);
            });

            this.totalForms.val(ndx+1);
            this._updateTable();
        },
        _updateItem: function (id) {
            var _this = this;
            var elem = _this._cloneForm(this._elem.find('#'+this._options.prefix+'-form-'+id)).contents();

            this._dialog = $('<div class="fieldset-dialog"><form></form></div>');
            this._dialog.find('form').validate({errorElement: "div"});
            elem.appendTo(this._dialog.find('form'));

            this._dialog.dialog({
                title: this._options.updateTitle,
                modal: true,
                buttons: {
                    "Editar": function () {
                        if (!_this._dialog.find('form').valid())
                             return;

                        var data = _this._cloneForm(_this._dialog.find('form')).contents();
                        $(this).dialog('destroy');
                        _this._dialog.remove();
                        
                        _this._updateForm(id, data);
                    },
                    "Cancelar": function () {
                        $(this).dialog('destroy');
                        _this._dialog.remove();
                    }
                }
            });
        },
        _updateForm: function (id, form) {
            var p = this._elem.find('div.forms #'+this._options.prefix+'-form-'+id);
            p.empty();
            form.appendTo(p);

            this._updateTable();
        },
        _deleteItem: function (id) {
            this._elem.find('div.forms #'+this._options.prefix+'-form-'+id).remove();
            var forms = this._elem.find('div.forms div.formset-form');
            this.totalForms.val(forms.length);

            for (var _i=0; _i<forms.length; _i++) {
                this._updateFormIndex(forms.eq(_i), _i);
            }

            this._updateTable();
        },
        _updateFormIndex: function (form, ndx) {
            var idRegex = new RegExp(this._options.prefix + '-(\\d+|__prefix__)-'),
            replacement = this._options.prefix + '-' + ndx + '-';
            
            form.find(this.childElementSelector).each(function() {
                var e = $(this);
                if (e.attr("for"))
                    e.attr("for", e.attr("for").replace(idRegex, replacement));

                if (e.attr('id'))
                    e.attr('id', e.attr('id').replace(idRegex, replacement));

                if (e.attr('name'))
                    e.attr('name', e.attr('name').replace(idRegex, replacement));
            });

            form.attr('id', this._options.prefix+'-form-'+ndx);
        }
    };

    $.fn.fieldSetTable = function (options) {
        /*
          Opções
          {
                prefix: //prefixo do fieldset
                addTitle: //título do dialogo de adicionar novo item
                updateTitle: //título do dialogo de editar item
                tableAttrs: [], //lista de attributos que irão para a tabela 
                tableTitles: [], //título dos atritutos que irão para a tabela
                addButton: ,//título do butão de adicionar novo item
                actionLabel: //título da coluna de ações
           }
         */
        var obj = new FieldSetTable(this, options);
        $(this).data('fieldset.table', obj);
    };
})(jQuery);